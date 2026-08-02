# ng-speed-test

Angular library for measuring internet download speed in the browser, published to npm as
[`ng-speed-test`](https://www.npmjs.com/package/ng-speed-test). Ships a single injectable service; there is no
component in the public API. A demo app lives in the same repo and is deployed to
https://ng-speed-test.jrquick.com.

## Coordinated work — read this if you are here to change something

Modernization work is tracked across threads in `.claude/work/`:

- [PROMPT.md](.claude/work/PROMPT.md) — the briefing for a thread picking up work. Start here.
- [PLAN.md](.claude/work/PLAN.md) — milestones and the reasoning behind their ordering. Stable.
- [CHECKLIST.md](.claude/work/CHECKLIST.md) — the live task list. Claim an item before working on it and move it
  to the Completed log when done.

Do not start ad-hoc work on this repo without checking the checklist first — the item may already exist, be
claimed, or be blocked on something you'd otherwise trip over.

## Repository layout

This is an Angular CLI **multi-project workspace with an unusual root layout** — the library is not under
`projects/`:

| Path | What it is |
|------|------------|
| `src/` | **Library source** (angular.json project `ng-speed-test`, `root: ""`, `sourceRoot: "src"`) |
| `src/public-api.ts` | The entry point ng-packagr compiles. Anything not reachable from here is not shipped. |
| `projects/demo/` | Demo Angular app (angular.json project `demo`) |
| `dist/ng-speed-test/` | ng-packagr output — **committed to git** |
| `dist/demo/` | Built demo site — **committed to git**, this is what gets hosted |
| `docs/` | compodoc output — **committed to git** |
| `demo/` (repo root) | Untracked stale build cache. Not source. Ignore it. |

Because `dist/` and `docs/` are tracked, any build you run dirties the working tree. Either commit the
regenerated output deliberately as part of a release, or `git checkout -- dist docs && git clean -fd dist docs`
when you were only building to verify.

## Commands

Working:

```bash
npm run build          # ng build ng-speed-test -> dist/ng-speed-test
npm run build:watch    # ng build ng-speed-test --watch
npm run build:link     # build + npm link from dist/ng-speed-test, for local consumer testing
npm run typecheck      # tsc --noEmit -p tsconfig.lib.json (library, no Node-preflight-gated `ng` CLI involved)
npm run typecheck:demo # tsc --noEmit -p projects/demo/tsconfig.app.json
npm run verify         # build + demo:build; this is what CI runs
npm run demo           # ng serve demo (dev server)
npm run demo:build     # ng build demo --configuration production
npm run docs / docs:build   # compodoc -> docs/
npm run docs:serve     # docs:build -s
npm run docs:watch     # docs:build -s -w
npm run pack           # build + npm pack ./dist/ng-speed-test --pack-destination ./dist/ng-speed-test
npm run release        # build + npm publish ./dist/ng-speed-test
npm run release:dry    # build + npm publish ./dist/ng-speed-test --dry-run
npm run clean          # rimraf dist/ng-speed-test
npm run restore:dist   # git checkout -- dist docs && git clean -fd dist docs
npm run clean:all      # rimraf dist/ng-speed-test node_modules && npm ci
```

Known broken — do not suggest these to the user as verification steps without fixing them first:

- `npm run lint` / `npm run test` / `npm run test:watch` are now stub scripts that print an explanatory message
  (pointing at `.claude/work/CHECKLIST.md` B1/B2) and `exit 1`, rather than shelling out to `ng` and failing with
  a confusing `ng` error. The underlying gaps are unchanged: `eslint`, `angular-eslint`, and `typescript-eslint`
  are in `devDependencies` but there is no `eslint.config.js`/`.eslintrc` and no `lint` architect (B1); the
  `ng-speed-test` project in `angular.json` has only a `build` architect and there are no `.spec.ts` files under
  `src/` (B2).

Fixed as of A1/A7/A8/A11 (2026-08-02) — no longer broken:

- `npm run shipit` / `shipit:dry` no longer chain `lint`/`test` (those targets don't exist yet); the chains now
  go straight to `build` → `demo:build` → `docs:build` → `release`/`release:dry`.
- `npm run demo:build` — the `@angular/material` import failure was purely a symptom of the broken install
  below, not a demo source problem. It resolves cleanly now that `node_modules` actually matches
  `package.json`. (It may still fail to *run* to completion on a machine with an old Node — see the Node version
  note below, which is a separate, unrelated gate.)
- `tslint.json` and `src/speed-test.component.ts` (see Gotchas) are deleted.
- `npm run publish` / `npm run publish:dry` were renamed to `npm run release` / `npm run release:dry` (A11) —
  `publish` is a reserved npm lifecycle name that npm runs as a post-hook of `npm publish` itself, so a script
  called `publish` at the repo root made `npm publish --dry-run` trigger a real publish. See "Versioning and
  release" below.

### `npm install` — fixed, but read this if a build still fails

A clean `npm install` used to abort with `ERESOLVE`: `@angular-devkit/build-angular@22.1.2` required
`@angular/compiler-cli@^22`, `ng-packagr@^22`, and `typescript >=6.0 <6.1`, while the rest of the toolchain was
Angular `20.1.3` / ng-packagr `20.1.0` / TypeScript `5.8.3`. That was an unvalidated Dependabot bump two majors
ahead of everything else. **Fixed 2026-08-02**: `@angular-devkit/build-angular` and `@angular/cli` are now pinned
to `20.3.32`, and every `@angular/*` framework package (`animations`, `common`, `compiler`, `compiler-cli`,
`core`, `forms`, `platform-browser`, `platform-browser-dynamic`, `router`) is pinned to the identical exact
version `20.3.27` — Angular's framework packages peer-require exact version matches, not ranges, so a lockstep
pin across the whole family was necessary, not just bumping `build-angular` alone. `@angular/cdk` and
`@angular/material` are pinned to `20.2.14`. `npm ci` now succeeds from a clean `node_modules` with no
`--legacy-peer-deps`, and `package-lock.json` was regenerated against this set.

**New blocker uncovered by this fix — read before trusting a local build failure:** this Angular 20.3.x
toolchain has a hard Node.js version preflight in `@angular/cli` (present since the *first* 20.x release, not a
version-pinning mistake): it requires `node: '^20.19.0 || ^22.12.0 || >=24.0.0'`. A machine on an older Node
(e.g. `v20.5.1`) will see `npm ci` succeed but `npm run build` / `npm run demo:build` / anything that shells out
to `ng` fail immediately with *"The Angular CLI requires a minimum Node.js version..."* — this is an environment
gap, not a regression from the dependency fix. `.github/workflows/ci.yml` pins Node `22.x` so CI is unaffected;
locally, either upgrade Node or run `npm run typecheck` / `npm run typecheck:demo` (thin wrappers around
`tsc --noEmit -p tsconfig.lib.json` / `-p projects/demo/tsconfig.app.json`) as a lighter proxy check that
doesn't go through the `ng` CLI's preflight gate.

Also note: `.npmrc` now sets `engine-strict=true`, so on a Node version outside the `engines` range, `npm ci` /
`npm install` themselves now hard-fail instead of just printing an `EBADENGINE` warning — the version gate moved
earlier, to install time.

## Architecture

Everything meaningful is in [speed-test.service.ts](src/services/speed-test.service.ts).

**How a measurement works.** `getBps()` merges caller settings over defaults, validates, then calls the private
`downloadTest()`, which recurses once per iteration:

1. `checkConnectivity()` — short-circuits on `navigator.onLine === false`, then does a 3s `HEAD` fetch to
   confirm real connectivity.
2. `fetch()` the configured file with a 15s abort timeout, timing `start()` → `end()` on a
   `SpeedTestResultsModel`. Speed is `fileSize * 8 / durationSeconds` — it trusts the configured `size`, it does
   not read the actual response length.
3. Failures call `testResult.error()`, which leaves `speedBps` at 0 so the iteration is discarded rather than
   skewing the average. The recursion decrements `settings.iterations` and stops at 1, then averages only the
   iterations with `speedBps > 0`. If every iteration failed, the observable errors.

`getKbps()` and `getMbps()` are `map` wrappers over `getBps()` dividing by 1024 (binary, not 1000).
`getSpeedTestResult()` wraps `getBps()` and adds an overall `timeout()` of 20s.

**Connectivity monitoring.** `isOnline()` and `getNetworkStatus()` merge `window` `online`/`offline` events with
the current `navigator.onLine`, then verify each "online" signal through `checkConnectivity()`.
`getNetworkStatus()` additionally surfaces `effectiveType`/`downlink` from the vendor-prefixed
`navigator.connection` when the browser exposes it.

### Gotchas worth knowing before changing this code

- **`checkConnectivity()` hardcodes a third-party endpoint**: `https://httpbin.org/get?minimal=true`. It runs on
  every speed test *and* on every `isOnline()` / `getNetworkStatus()` emission. It uses `mode: 'no-cors'`, so the
  response is opaque and only outright network/DNS failure is detectable — HTTP errors from httpbin read as
  success. If httpbin is down or blocked, the whole library reports offline. There is no way to configure this
  URL; making it configurable would be a real improvement.
- **Defaults point at a pinned GitHub raw URL.** `SpeedTestFileModel` defaults to a 5MB JPEG at a specific
  commit SHA under `raw.githubusercontent.com`. The byte sizes in the defaults and in the README (408,949 /
  1,197,292 / 4,952,221 / 13,848,150) must match the real files or every reported speed is wrong by that ratio.
- **`src/speed-test.component.ts` was dead and did not compile** (deleted 2026-08-02, A7). It imported
  `SpeedTestResult` from `./models/speed-test-results.model`, which exports `SpeedTestResults` and
  `SpeedTestResultsModel` — no such symbol. It survived only because `public-api.ts` never exported it, so
  ng-packagr never type-checked it. Don't resurrect it as a reference — it never worked.
- **`SpeedTestModule` is nearly vestigial.** The service is `providedIn: 'root'`, so importing the module is not
  actually required despite what the README's quick start implies.
- **The demo does not consume the built package.** `projects/demo/src/app/app.module.ts` and `app.component.ts`
  import from `'../../../../src/services/speed-test.service'` — a relative path straight into library source.
  Editing `src/` is reflected in `npm run demo` with no rebuild, but it also means the demo never exercises the
  real package entry point or the `public-api.ts` export surface. `demo:test` and the
  `paths: { "ng-speed-test": [...] }` mapping in `projects/demo/tsconfig.json` exist to test the linked package
  path, but the source imports currently bypass them.

## Conventions

- **Model pattern.** Each model file exports a plain `interface` for the shape and a `class XModel implements X`
  carrying the defaults, with a `constructor(partial?: Partial<X>)` that copies each field individually with an
  explicit `!== undefined` check. `SpeedTestService.mergeSettings()` repeats the same field-by-field merge.
  Verbose, but it is the established style — follow it rather than introducing spread/`Object.assign`, and
  remember that **adding a settings field means updating both the model constructor and `mergeSettings()`**.
- Public service methods return `Observable`s and are documented with a short JSDoc block.
- The library uses 4-space indentation; the demo app uses 2. Match whichever file you're in.
- Errors thrown from validation are prefixed `ng-speed-test: `.
- TypeScript is `strict` with `noPropertyAccessFromIndexSignature` and `strictTemplates`. Non-null assertions
  (`settings.file!`) are used liberally on optional settings fields after validation.

## Versioning and release

- Peer range is `^16 || ^17 || ^18 || ^19 || ^20` for `@angular/common` and `@angular/core`. When adding Angular
  version support, update `peerDependencies`, the `keywords` list, the README compatibility table, and the
  README Angular badge together.
- `CHANGELOG.md` is stale — it stops at `2.3.2` while `package.json` is at `3.2.1`. If you're making a release,
  backfill or at least add the current entry; follow the existing Keep a Changelog format with the
  `by [author](link)` attribution suffix.
- Release path is `npm run release` (build, then `npm publish` from `dist/ng-speed-test`; `npm run release:dry`
  for a dry run). These were renamed from `publish`/`publish:dry` (A11) because `publish` is a reserved npm
  lifecycle event name that npm invokes as a post-hook of `npm publish` itself — a script named `publish` at the
  repo root meant `npm publish --dry-run` at the repo root triggered a real publish. A `prepublishOnly` guard now
  also blocks publishing from the repo root outright (the root package is not `private` — see the Gotchas-style
  reasoning in CHECKLIST A11 — and shares the name/version of the real package, so it must never be publishable
  itself). `npm run shipit` / `shipit:dry` are the intended one-shot chains (`build` → `demo:build` → `docs:build`
  → `release`/`release:dry`).
- `master` is the default branch. History is overwhelmingly Dependabot merges; keep hand-written commits scoped
  and descriptive.
