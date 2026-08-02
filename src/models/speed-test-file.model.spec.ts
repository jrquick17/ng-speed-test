import { describe, expect, it } from 'vitest';

import { SpeedTestFileModel } from './speed-test-file.model';

describe('SpeedTestFileModel', () => {
    it('uses the built-in defaults when constructed with no argument', () => {
        const model = new SpeedTestFileModel();

        expect(model.path).toContain('raw.githubusercontent.com');
        expect(model.shouldBustCache).toBe(true);
        expect(model.size).toBe(4952221);
    });

    it('overrides only the fields present in a partial file', () => {
        const model = new SpeedTestFileModel({ path: 'https://example.com/file.bin' });

        expect(model.path).toBe('https://example.com/file.bin');
        expect(model.shouldBustCache).toBe(true);
        expect(model.size).toBe(4952221);
    });

    it('merges every field individually when all are provided', () => {
        const model = new SpeedTestFileModel({
            path: 'https://example.com/other.bin',
            shouldBustCache: false,
            size: 1024
        });

        expect(model.path).toBe('https://example.com/other.bin');
        expect(model.shouldBustCache).toBe(false);
        expect(model.size).toBe(1024);
    });

    it('does not treat explicit falsy values as absent', () => {
        const model = new SpeedTestFileModel({ shouldBustCache: false, size: 0 });

        expect(model.shouldBustCache).toBe(false);
        expect(model.size).toBe(0);
    });
});
