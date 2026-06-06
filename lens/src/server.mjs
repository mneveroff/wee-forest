import express from 'express';
import { DuckDBInstance } from '@duckdb/node-api';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

import rateLimit from 'express-rate-limit';
import { captureEvent, shutdownPostHog } from './posthog.mjs';
import { buildRuntimeConfigScript } from './runtime-config.mjs';

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000 // limit each IP to 10000 requests per windowMs
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const readdir = promisify(fs.readdir);

const app = express();
app.set('trust proxy', 1); // Necessary for caddy / reverse-proxy
const db = await DuckDBInstance.create(process.env.DUCKDB_PATH);
const creatorCon = await db.connect();
const areaCon = await db.connect();

async function all(con, query) {
    const reader = await con.runAndReadAll(query);
    return reader.getRowObjectsJS();
}

async function loadAll(dataDir, overwrite = false) {
    console.log('Loading Parquet files');

    const files = await readdir(dataDir);
    const parquetFiles = files.filter(file => file.endsWith('.parquet'));

    try {
        for (const file of parquetFiles) {
        
            await loadParquet(creatorCon, path.join(dataDir, file), overwrite);
        }
    }
    catch (error) {
        console.log('An error occurred while loading Parquet files');
        console.error(error);
    }
    finally {
        console.log('Finished loading Parquet files');
    }
}

async function loadParquet(con, filePath, overwrite = false) {
    const tableName = path.basename(filePath, '.parquet');

    if (overwrite) {
        await con.run(`DROP TABLE IF EXISTS ${tableName}`);
    }

    await con.run(`
        CREATE TABLE IF NOT EXISTS ${tableName} AS
        SELECT * FROM parquet_scan('${filePath}')
    `);
}

function getPostHogDistinctId(req) {
    const distinctId = req.get('x-posthog-distinct-id');

    if (distinctId) {
        return distinctId;
    }

    return req.ip || 'anonymous';
}

async function createIndexes() {
    console.log('Creating indexes for duckdb. Requests are served un-indexed for now.');

    try {
        const tables = await all(creatorCon, "SHOW TABLES");

        for (const table of tables) {
            console.log(`Creating indexes for table ${table.name}`);

            const columns = await all(creatorCon, `PRAGMA table_info(${table.name})`);

            for (const column of columns) {
                const indexName = `idx_${table.name}_${column.name}`;
                const indexExists = await all(creatorCon, `SELECT name FROM sqlite_master WHERE type='index' AND name='${indexName}'`);

                if (indexExists.length > 0) {
                    console.log(`Index ${indexName} already exists, skipping`);
                } else {
                    console.log(`Creating index for column ${column.name} in table ${table.name}`);
                    await creatorCon.run(`CREATE INDEX ${indexName} ON ${table.name} (${column.name})`);
                }
            }
        }
    } 
    catch (error) {
        console.log('An error occurred while creating indexes');
        console.error(error);
    }
    finally {
        console.log('Finished creating indexes');
    }
}

const staticServerPath = process.env.STATIC_SERVER_PATH ? process.env.STATIC_SERVER_PATH + '/' : '';
const postHogProxyPath = staticServerPath + (process.env.POSTHOG_PROXY_PATH || 'ingest');
const postHogProxyPathRewrite = '^/' + postHogProxyPath;
const postHogProxy = createProxyMiddleware({
    target: process.env.POSTHOG_HOST || 'https://eu.i.posthog.com',
    changeOrigin: true,
    pathRewrite: {
        [postHogProxyPathRewrite]: ''
    }
});

app.use('/' + postHogProxyPath, postHogProxy);

function serveRuntimeConfig(_req, res) {
    res.type('application/javascript');
    res.set('Cache-Control', 'no-store');
    res.send(buildRuntimeConfigScript());
}

app.get('/runtime-config.js', serveRuntimeConfig);
if (staticServerPath) {
    app.get('/' + staticServerPath + 'runtime-config.js', serveRuntimeConfig);
}

const areaServerPath = '/' + staticServerPath + process.env.AREA_SERVER_PATH || '/';
app.get(areaServerPath + '/calculate_areas', limiter, async (req, res, next) => {
    try {
        const { bounds, dataset, type } = req.query;

        if (!bounds) {
            return res.status(400).json({ error: 'Missing bounds parameter' });
        }

        const boundsArray = bounds.split(',').map(Number);

        // Query DuckDB for the data within the bounding box
        const query = `
            SELECT ${type}, SUM(area_ha) as total_area
            FROM ${dataset}_points
            WHERE y BETWEEN ${boundsArray[1]} AND ${boundsArray[3]} AND x BETWEEN ${boundsArray[0]} AND ${boundsArray[2]}
            GROUP BY ${type}
        `;

        const areas = await all(areaCon, query);
        const result = areas.reduce((acc, row) => {
            acc[row[type]] = row.total_area;
            return acc;
        }, {});

        captureEvent({
            distinctId: getPostHogDistinctId(req),
            event: 'area calculated',
            properties: {
                dataset,
                type,
                bounds,
                result_count: Object.keys(result).length,
                $current_url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
            },
        });

        res.json(result);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

async function shutdown(signal) {
    console.log(`Received ${signal}, flushing PostHog events`);
    await shutdownPostHog();
    process.exit(0);
}

process.once('SIGINT', () => {
    void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
});

const port = process.env.AREA_PORT || 3939;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});


let recreateDatabase = process.env.RECREATE_DATABASE ? process.env.RECREATE_DATABASE === 'true' : false;
// Load all Parquet files without awaiting and then create indexes
loadAll(process.env.PARQUET_PATH, recreateDatabase).catch(console.error)
.then(() => createIndexes()).then(() => creatorCon.disconnectSync());

const tileServerUrl = process.env.TILE_SERVER_HOST + '/' + 
staticServerPath + (process.env.TILE_SERVER_PATH || '/');
const tileserver = spawn('tileserver-gl', ['-c', 'tileserver-config.json', '--public_url', tileServerUrl || '']);

tileserver.stdout.on('data', (data) => {
    console.log(`tileserver-gl: ${data}`);
});

tileserver.stderr.on('data', (data) => {
    console.error(`tileserver-gl: ${data}`);
});

tileserver.on('close', (code) => {
    console.log(`tileserver-gl exited with code ${code}`);
});

const tileServerPath = staticServerPath + (process.env.TILE_SERVER_PATH || '/');
const tileServerPathRewrite = '^/' + tileServerPath;

const tileserverProxy = createProxyMiddleware({
    target: 'http://localhost:8080',
    pathRewrite: {
        [tileServerPathRewrite]: ''
    }
});

app.use('/' + tileServerPath, limiter, tileserverProxy);

app.use('/' + staticServerPath, limiter, express.static(path.join(__dirname, process.env.STATIC_DIR || 'public')));

const siteDistPath = process.env.SITE_DIST_PATH || path.join(__dirname, '../../site/dist');
if (fs.existsSync(siteDistPath)) {
    app.use(limiter, express.static(siteDistPath, { index: 'index.html', extensions: ['html'] }));
    console.log(`Serving Astro site from ${siteDistPath}`);
} else {
    console.log(`Astro site dist not found at ${siteDistPath}; serving Lens only`);
}
