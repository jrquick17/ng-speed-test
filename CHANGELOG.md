# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
* **Breaking:** `getKbps()`/`getMbps()`, `SpeedTestResultsModel.speedKbps`/`speedMbps`, and
  `getSpeedTestResult()`'s `kbps`/`mbps` now use the decimal convention (1 Kbps = 1,000 bps, 1 Mbps =
  1,000,000 bps) instead of dividing by 1024, matching the convention used by ISPs, speedtest.net, and
  fast.com. Reported Kbps values increase by a factor of 1024/1000 (2.4% higher than before); reported Mbps
  values increase by a factor of 1024²/1,000,000 = 1.048576 (4.8576% higher than before). `getBps()`/`bps` are
  unaffected — bits per second was never unit-ambiguous by [jrquick17](https://github.com/jrquick17)

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
