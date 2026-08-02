// engines describes the toolchain needed to build this repo, not to run the
// published browser library. ng-packagr copies it verbatim into
// dist/ng-speed-test/package.json, where it becomes a runtime install
// constraint that contradicts the Angular 16-20 peerDependencies range.
import { readFileSync, writeFileSync } from 'node:fs';

const pkgPath = new URL('../dist/ng-speed-test/package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

delete pkg.engines;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
