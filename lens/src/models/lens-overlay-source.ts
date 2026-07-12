/** Stable across year changes so React does not tear down the painted overlay. */
export function lensOverlaySourceId(
    datasetId: string,
    mapRole: 'primary' | 'comparison',
): string {
    return `${datasetId}_${mapRole}`;
}
