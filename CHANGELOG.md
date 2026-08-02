# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
