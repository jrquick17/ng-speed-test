# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0]
### Changed
* **Breaking:** `getKbps()`/`getMbps()`, `SpeedTestResultsModel.speedKbps`/`speedMbps`, and
  `getSpeedTestResult()`'s `kbps`/`mbps` now use the decimal convention (1 Kbps = 1,000 bps, 1 Mbps =
  1,000,000 bps) instead of dividing by 1024, matching the convention used by ISPs, speedtest.net, and
  fast.com. Reported Kbps values increase by a factor of 1024/1000 = 1.024× (2.4% higher than `3.x`); reported
  Mbps values increase by a factor of 1024²/1,000,000 = 1.048576× (4.8576% higher than `3.x`). `getBps()`/`bps`
  are unaffected — bits per second was never unit-ambiguous. This first shipped in error as an undisclosed
  breaking change in the `3.4.0` minor, was reverted in `3.4.1`, and is re-applied here correctly gated behind
  a major, with this note, by [jrquick17](https://github.com/jrquick17)
* **Breaking:** Speed is now computed from the actual number of bytes received (the real transferred size of
  the response body), not the configured `file.size`. A redirected, re-encoded, truncated, or otherwise
  changed file now reports its real speed instead of a confidently wrong number derived from the configured
  hint. For a correctly-configured `file.size` matching the real file, this is usually unchanged; the
  difference only shows up when the served file doesn't actually match the hint. `SpeedTestFile.size` is now
  optional and is no longer validated or used in the speed calculation — it's an unused hint kept for
  informational purposes only. `SpeedTestResultsModel`'s constructor no longer takes a `fileSize` argument,
  and `end()` now takes the actual `bytesReceived`. This first shipped in error as an undisclosed breaking
  change in the `3.4.0` minor, was reverted in `3.4.1`, and is re-applied here correctly gated behind a major,
  with this note, by [jrquick17](https://github.com/jrquick17)
* **Breaking:** Multi-iteration results (`iterations` > 1, the default is 3) are now aggregated with the
  median instead of the arithmetic mean. At `iterations <= 2` the reported number is unchanged (median and
  mean agree there); at `iterations >= 3`, a single divergent iteration — a network blip or a burst of extra
  throughput — now has little to no influence on the result, instead of dragging it toward the outlier. There
  is no fixed conversion ratio; the size of the change is data-dependent (zero when iterations happen to
  agree, largest when exactly one iteration was a severe outlier) by [jrquick17](https://github.com/jrquick17)
* **Breaking:** `peerDependencies` for `@angular/common`/`@angular/core` narrowed from
  `^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^20.0.0 || ^21.0.0 || ^22.0.0` to
  `^20.0.0 || ^21.0.0 || ^22.0.0`. Consumers on Angular 16 through 19 cannot install `^4.0.0` — stay on the
  latest `3.x` release, or upgrade your application to Angular 20+ first, by
  [jrquick17](https://github.com/jrquick17)

### Added
* Signal-based equivalents of every core method: `getBpsSignal()`, `getKbpsSignal()`, `getMbpsSignal()`, and
  `getSpeedTestResultSignal()`. Each is a thin wrapper returning a `Signal<T | undefined>` that starts
  `undefined` and updates once the test completes; each takes the same settings argument as its `Observable`
  counterpart plus an optional trailing `injector` parameter. Must be called within an injection context
  (e.g. a component field initializer) unless an explicit `injector` is passed. Verified to work correctly in
  zoneless applications by [jrquick17](https://github.com/jrquick17)

### Migration notes
If you're upgrading from `3.x`:
* **Displayed Kbps/Mbps values will increase** (~2.4% / ~4.86%) even with no code changes, because of the
  decimal-vs-binary unit change above. This is a display change, not a regression — bps/`getBps()` is
  unaffected, and the new numbers match what other speed test tools report for the same connection.
* **Reported speed may change** if your configured `file.size` doesn't match the real size of the file being
  served (e.g. behind a redirect, or after re-encoding). If your `file.size` matches the real file, expect no
  change. `file.size` is now optional — omitting it is fully supported and no longer affects validation.
* **Multi-iteration results may differ slightly** (`iterations >= 3`, the default) if any of your recent runs
  had an outlier iteration — the median discounts it where the old mean didn't. Single-iteration
  (`iterations: 1`) and two-iteration results are unaffected.
* **`peerDependencies` no longer include Angular 16-19.** If your app is on one of those versions, `npm
  install ng-speed-test@^4` will fail to resolve — either stay on `ng-speed-test@^3` or upgrade Angular first.
* Everything else — the `Observable`-returning API surface, `provideSpeedTest()`, connectivity monitoring,
  warm-up/streaming/duration-sampling behavior from `3.5.0`/`3.6.0`/`3.7.0` — is unchanged.

## [3.7.0]
### Changed
* Upgraded the workspace toolchain from Angular 21 to Angular 22 (`@angular/core`/`cli`/`cdk`/`material`/etc.,
  TypeScript 6.0, `angular-eslint`). Tooling/build upgrade only, not a change to the library's public API or
  runtime behavior — no source in `src/` changed. Widened `peerDependencies` for `@angular/common` and
  `@angular/core` to additionally accept `^22.0.0`, alongside the existing `^16.0.0` through `^21.0.0` by
  [jrquick17](https://github.com/jrquick17)
* **Minimum supported Node.js version increased**: `^22.22.3 || ^24.15.0 || >=26.0.0` (Node 20.x is no longer
  supported as of Angular 22's own toolchain requirement) by [jrquick17](https://github.com/jrquick17)
* Migrated the demo app off the deprecated `@angular-devkit/build-angular` Webpack-based builders entirely, onto
  `@angular/build:application`/`dev-server`/`extract-i18n` (esbuild/Vite-based), via `ng update`'s official
  `use-application-builder` migration. Explicitly set `outputPath.browser: ""` to keep the demo's build output
  landing directly in `dist/demo/` (the new builder's default is `dist/demo/browser/`, which would have broken
  the deployed site at https://ng-speed-test.jrquick.com without a hosting-config change to match) by
  [jrquick17](https://github.com/jrquick17)
* Added `changeDetection: ChangeDetectionStrategy.Eager` to the demo's `AppComponent`, via `ng update`'s
  migration — Angular 22 changed the implicit default change-detection strategy for new components; this keeps
  the existing component's pre-v22 behavior explicit rather than silently changing on upgrade by
  [jrquick17](https://github.com/jrquick17)

### Fixed
* `tsconfig.json` now sets `"ignoreDeprecations": "6.0"` — TypeScript 6.0 deprecates the `baseUrl` compiler
  option (used here for the demo's `paths` mapping that consumes the built library from `dist/ng-speed-test`
  rather than `node_modules`), and will remove it entirely in TypeScript 7.0. This is a stopgap, not a fix — a
  real migration off `baseUrl`-relative `paths` resolution is tracked as a follow-up item by
  [jrquick17](https://github.com/jrquick17)
* Several `tsconfig*.json` files gained `angularCompilerOptions.extendedDiagnostics` suppressions for
  `nullishCoalescingNotNullable`/`optionalChainNotNullable`, via `ng update`'s migration — these became stricter
  template diagnostics in Angular 22; suppressing them preserves pre-v22 template type-checking behavior by
  [jrquick17](https://github.com/jrquick17)

## [3.6.0]
### Changed
* Upgraded the workspace toolchain from Angular 20 to Angular 21 (`@angular/core`/`cli`/`cdk`/`material`/etc.,
  TypeScript, `angular-eslint`, `vitest`). This is a tooling/build upgrade, not a change to the library's public
  API or runtime behavior — no source in `src/` changed. Widened `peerDependencies` for `@angular/common` and
  `@angular/core` to additionally accept `^21.0.0`, alongside the existing `^16.0.0` through `^20.0.0` by
  [jrquick17](https://github.com/jrquick17)
* Migrated the demo app's bootstrap to Angular 21's `applicationProviders` bootstrap option and its template to
  the modern `@if`/`@for` block control-flow syntax (replacing `*ngIf`/`*ngFor`), via `ng update`'s official
  migration schematics — no behavior change, same rendered output by
  [jrquick17](https://github.com/jrquick17)

### Fixed
* `tsconfig.json`'s `moduleResolution` moved from `"node"` (classic) to `"bundler"`, required for Angular
  Material 21's package.json `"exports"`-map-based subpath resolution (e.g. `@angular/material/icon`), which
  the old resolution mode cannot read at all by [jrquick17](https://github.com/jrquick17)
* The library's `build` architect now uses `@angular/build:ng-packagr` instead of the legacy
  `@angular-devkit/build-angular:ng-packagr`, resolving an "unsupported buildTarget" warning from the
  `unit-test` architect by [jrquick17](https://github.com/jrquick17)

## [3.5.0]
### Added
* A warm-up iteration now runs once, before the first timed measurement: an untimed request against the
  configured file whose response is discarded, so DNS lookup / TLS handshake / TCP slow-start land before
  timing starts instead of being counted as transfer time. Warmed-up results are equal to or higher than
  before, never lower — most noticeable with `iterations: 1`, where there was previously nothing to average
  the deflated first sample against by [jrquick17](https://github.com/jrquick17)
* SSR guards on `isOnline()`/`getNetworkStatus()` — both now report a safe single-emission default
  (`isOnline(): true`, `getNetworkStatus(): { isOnline: true }`) when evaluated during a server render instead
  of throwing on the missing `window`/`navigator` by [jrquick17](https://github.com/jrquick17)
* The response body is now read via its `ReadableStream` (`response.body.getReader()`), accumulating bytes
  chunk by chunk instead of buffering the whole body via `response.blob()` first. This enables a new opt-in
  `SpeedTestSettings.maxSampleDuration` (ms): once elapsed time since the first byte reaches this value, the
  read is cancelled and the iteration completes from a partial download instead of always requiring the full
  configured file. Left unset (the default), behavior is unchanged — the full body is always read to
  completion by [jrquick17](https://github.com/jrquick17)
* Real ESLint configuration (`eslint.config.js`, flat config) for both the library and demo projects —
  `npm run lint` is a working command again, and now gates `verify`/`shipit`/`shipit:dry` by
  [jrquick17](https://github.com/jrquick17)

### Fixed
* `mergeSettings()` no longer silently keeps the default file's stale `size` (`4,952,221`) when a caller
  changes `file.path` without also supplying `file.size`. It now clears the merged `size` instead, which
  `validateSettings()` correctly rejects with `ng-speed-test: Valid file size is required` — a caller who
  previously got a confidently wrong reported speed for their custom file now gets a clear error asking them
  to supply `size`, rather than a silently incorrect number by [jrquick17](https://github.com/jrquick17)

## [3.4.1]
### Fixed
* **Reverts two breaking changes that were released in `3.4.0`, a minor.** `3.4.0` shipped a decimal-vs-binary
  Kbps/Mbps unit change and a switch to computing speed from the actual response body instead of the configured
  `file.size` — both real bugs worth fixing, but breaking changes to reported numbers belong in a major with
  explicit migration notes, never an undisclosed minor. Because `ng-speed-test` is published under a `^3.0.0`
  peer range, `3.4.0` was silently resolved by anyone running `npm update`, with no way to opt out short of
  pinning an exact version. This release restores `3.3.0`'s exact behavior on the `3.x` line: `getKbps()`/
  `getMbps()`, `SpeedTestResultsModel.speedKbps`/`speedMbps`, and `getSpeedTestResult()`'s `kbps`/`mbps` divide by
  1024 again, and speed is once again computed from the configured `file.size` (`SpeedTestFile.size` is required
  again). Both changes will be re-applied correctly in a future major release, with full migration notes. The
  one deliberate exception: the not-yet-released `maxSampleDuration` option (added after `3.4.0`, never
  published) still computes speed from the actual bytes read when a caller opts into it, since a cancelled
  partial read has no other sane divisor — this is not part of what's being reverted here by
  [jrquick17](https://github.com/jrquick17)

## [3.4.0]
### Changed
* **Breaking, later reverted in `3.4.1` — do not rely on this in `3.x`:** `getKbps()`/`getMbps()`,
  `SpeedTestResultsModel.speedKbps`/`speedMbps`, and `getSpeedTestResult()`'s `kbps`/`mbps` used the decimal
  convention (1 Kbps = 1,000 bps, 1 Mbps = 1,000,000 bps) instead of dividing by 1024, matching the convention
  used by ISPs, speedtest.net, and fast.com. Reported Kbps values increased by a factor of 1024/1000 (2.4%
  higher); reported Mbps values increased by a factor of 1024²/1,000,000 = 1.048576 (4.8576% higher). `getBps()`/
  `bps` were unaffected — bits per second was never unit-ambiguous by [jrquick17](https://github.com/jrquick17)
* **Breaking, later reverted in `3.4.1` — do not rely on this in `3.x`:** Speed was computed from the actual
  number of bytes received (`Blob.size` of the fetched response), not the configured `file.size`.
  `SpeedTestFile.size` became optional and was no longer validated or used in the speed calculation.
  `SpeedTestResultsModel`'s constructor no longer took a `fileSize` argument, and `end()` took the actual
  `bytesReceived` by [jrquick17](https://github.com/jrquick17)

### Removed
* Broken README link to a nonexistent `CONTRIBUTING.md` by [jrquick17](https://github.com/jrquick17)

## [3.3.0]
### Added
* `provideSpeedTest()`, `SpeedTestConfig`, and the `SPEED_TEST_CONFIG` injection token, making the connectivity
  check URL/timeout, default test file, and overall timeout configurable — resolves
  [issue #108](https://github.com/jrquick17/ng-speed-test/issues/108) (httpbin 503s reporting every user
  offline) by [jrquick17](https://github.com/jrquick17)
* First unit test suite for the library, running on Vitest by [jrquick17](https://github.com/jrquick17)

### Changed
* `checkConnectivity()` no longer contacts `httpbin.org` (or any third party) by default — it now trusts
  `navigator.onLine` unless `connectivityCheckUrl` is explicitly configured by
  [jrquick17](https://github.com/jrquick17)

### Removed
* Demo's stale, non-compiling Karma test target and spec by [jrquick17](https://github.com/jrquick17)

## [3.2.2]
### Fixed
* `ERESOLVE` install failure caused by a two-major toolchain version mismatch; `@angular-devkit/build-angular`/
  `@angular/cli` and the whole `@angular/*` framework family are now pinned to matching versions by
  [jrquick17](https://github.com/jrquick17)
* `Infinity` speed result on a zero-duration test iteration by [jrquick17](https://github.com/jrquick17)
* Unsubscribing from (or timing out) a speed test no longer leaves the download running in the background by
  [jrquick17](https://github.com/jrquick17)
* `shipit`/`shipit:dry` no longer chain the non-existent `lint`/`test` targets by
  [jrquick17](https://github.com/jrquick17)

### Added
* CI workflow building the library and demo on every push/PR by [jrquick17](https://github.com/jrquick17)
* `engines` field and `.nvmrc` documenting the minimum supported Node.js version by
  [jrquick17](https://github.com/jrquick17)

### Removed
* Dead `speed-test.component.ts` (unreachable from the public API, did not compile) and unused `tslint.json` by
  [jrquick17](https://github.com/jrquick17)
* `console.warn` call from library code by [jrquick17](https://github.com/jrquick17)
* Unused `karma-phantomjs-launcher` require from `karma.conf.js` by [jrquick17](https://github.com/jrquick17)

## [3.2.1]
### Fixed
* `package.json` `main`/`exports` still referencing `bundles/`, `esm2020`, `fesm2020`, and `fesm2015` outputs
  that ng-packagr no longer produces by [jrquick17](https://github.com/jrquick17)

## [3.2.0]
### Update
* Angular 20 by [jrquick17](https://github.com/jrquick17)

## [3.1.0]
### Update
* Angular 19 by [jrquick17](https://github.com/jrquick17)

## [3.0.2]
### Update
* Dependencies by [jrquick17](https://github.com/jrquick17)

## [3.0.1]
### Changed
* Demo face lift by [jrquick17](https://github.com/jrquick17)

### Update
* Angular 18; dependencies by [jrquick17](https://github.com/jrquick17)

## [3.0.0]
### Changed
* Modernized library packaging: ES2022 build targets, a comprehensive `exports` map, and proper ng-packagr
  project configuration by [jrquick17](https://github.com/jrquick17)

### Update
* Angular 17, then Angular 18; dependencies by [jrquick17](https://github.com/jrquick17)

## [2.6.1]
### Fixed
* `window is not defined` error when the service runs outside a browser context by
  [jrquick17](https://github.com/jrquick17)

## [2.6.0]
### Update
* Dependencies by [jrquick17](https://github.com/jrquick17)

## [2.5.0]
### Update
* Angular 15; dependencies by [jrquick17](https://github.com/jrquick17)

## [2.4.0]
### Changed
* Migrated the library build to ng-packagr by [jrquick17](https://github.com/jrquick17)

### Update
* Angular 14; dependencies by [jrquick17](https://github.com/jrquick17)

## [2.3.3]
### Update
* Rebuild and republish; no source changes by [jrquick17](https://github.com/jrquick17)

## [2.3.2]
### Update
* Dependencies by [jrquick17](https://github.com/jrquick17)

## [2.3.1]
### Update
* Test documentation by [jrquick17](https://github.com/jrquick17)
* Dependencies by [jrquick17](https://github.com/jrquick17)

## [Released]

## [2.3.0]
### Update
* Angular 13 by [jrquick17](https://github.com/jrquick17)

## [2.2.1]
### Update
* Dependencies by [jrquick17](https://github.com/jrquick17)

## [2.2.0]
### Update
* Angular 12 by [jrquick17](https://github.com/jrquick17)

## [2.1.0]
### Remove
* Requirement for settings to get speed by [jrquick17](https://github.com/jrquick17)

## [2.0.0]
### Added
* Model for handling custom settings by [jrquick17](https://github.com/jrquick17)
* Setting for delaying the next iteration on network failure by [jrquick17](https://github.com/jrquick17)

### Changed
* Prefixed models with speed-test by [jrquick17](https://github.com/jrquick17)
* Exposed SpeedTestResultsModel by [jrquick17](https://github.com/jrquick17)

## [1.4.0]
### Added
* Add isOnline function by [sksaifuddin](https://github.com/sksaifuddin)

## [1.3.0]
### Added
* Record when offline by [jrquick17](https://github.com/jrquick17)

## [1.2.0]
### Added
* Support for Ivy by [jrquick17](https://github.com/jrquick17)
* Support for Angular 9 and Angular 10 by [jrquick17](https://github.com/jrquick17)

### Removed
* Deprecated use of `flatMap by [jrquick17](https://github.com/jrquick17)``

## [1.1.0]
### Added
* Ability to customize the downloaded image by [jrquick17](https://github.com/jrquick17)
* Ability to run multiple iterations for an average speed by [jrquick17](https://github.com/jrquick17)

### Changed
* Image route to use GitHub by [jrquick17](https://github.com/jrquick17)

## [0.0.6]
### Added
* Demo by [jrquick17](https://github.com/jrquick17)

## [0.0.1]
### Added
* Service for returning the current internet speed by [jrquick17](https://github.com/jrquick17)
