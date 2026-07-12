import { describe, expect, it } from 'vitest';
import { lensOverlaySourceId } from '@/models/lens-overlay-source';

describe('lensOverlaySourceId', () => {
    it('is stable across years (year is not part of the id)', () => {
        expect(lensOverlaySourceId('lcm', 'primary')).toBe('lcm_primary');
        expect(lensOverlaySourceId('lcm', 'comparison')).toBe('lcm_comparison');
        expect(lensOverlaySourceId('lcm', 'primary')).not.toContain('2012');
        expect(lensOverlaySourceId('lcm', 'primary')).not.toContain('2022');
    });
});
