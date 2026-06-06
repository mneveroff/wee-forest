import { PostHog } from 'posthog-node';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST || 'https://eu.i.posthog.com';

export const posthog = apiKey ? new PostHog(apiKey, { host }) : null;

if (posthog && process.env.POSTHOG_DEBUG === 'true') {
    posthog.debug(true);
}

/**
 * @param {{ distinctId: string, event: string, properties?: Record<string, unknown> }} event
 */
export function captureEvent(event) {
    if (!posthog) {
        return;
    }

    posthog.capture(event);
}

export async function shutdownPostHog() {
    if (!posthog) {
        return;
    }

    await posthog.shutdown();
}
