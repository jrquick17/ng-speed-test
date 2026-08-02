import { describe, expect, it } from 'vitest';

import { SpeedTestFile, SpeedTestFileModel } from './speed-test-file.model';
import { SpeedTestSettingsModel } from './speed-test-settings.model';

describe('SpeedTestSettingsModel', () => {
    it('uses the built-in defaults when constructed with no argument', () => {
        const model = new SpeedTestSettingsModel();

        expect(model.iterations).toBe(3);
        expect(model.retryDelay).toBe(500);
        expect(model.file).toEqual(new SpeedTestFileModel());
    });

    it('overrides only the top-level fields present in a partial settings object', () => {
        const model = new SpeedTestSettingsModel({ iterations: 1 });

        expect(model.iterations).toBe(1);
        expect(model.retryDelay).toBe(500);
        expect(model.file).toEqual(new SpeedTestFileModel());
    });

    it('rebuilds the file as a full SpeedTestFileModel, defaulting unset file fields', () => {
        // SpeedTestSettings.file is typed as the full SpeedTestFile, not Partial<SpeedTestFile>,
        // so a partial object only type-checks for a loosely-typed (e.g. plain JS) caller - the
        // cast simulates that caller to exercise the constructor's own `!== undefined` guards.
        const partialFile = { path: 'https://example.com/file.bin' } as unknown as SpeedTestFile;
        const model = new SpeedTestSettingsModel({ file: partialFile });

        expect(model.file).toBeInstanceOf(SpeedTestFileModel);
        expect(model.file!.path).toBe('https://example.com/file.bin');
        expect(model.file!.size).toBe(4952221);
        expect(model.file!.shouldBustCache).toBe(true);
    });

    it('merges every file field individually when all are provided', () => {
        const model = new SpeedTestSettingsModel({
            file: { path: 'https://example.com/other.bin', size: 1024, shouldBustCache: false }
        });

        expect(model.file!.path).toBe('https://example.com/other.bin');
        expect(model.file!.size).toBe(1024);
        expect(model.file!.shouldBustCache).toBe(false);
    });

    it('does not treat explicit falsy values as absent', () => {
        const model = new SpeedTestSettingsModel({ iterations: 0, retryDelay: 0 });

        expect(model.iterations).toBe(0);
        expect(model.retryDelay).toBe(0);
    });
});
