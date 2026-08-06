// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "dist/**",
      "docs/**",
      "out-tsc/**",
      ".angular/**",
    ],
  },
  {
    files: ["src/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "lib", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "lib", style: "kebab-case" },
      ],
    },
  },
  {
    files: ["projects/demo/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      // The demo intentionally uses NgModule bootstrap + constructor injection (see
      // CLAUDE.md's "SpeedTestModule is nearly vestigial" gotcha) - migrating to standalone
      // components/inject() is a separate, larger piece of work, not part of restoring lint.
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/prefer-inject": "off",
      // AppComponent uses ChangeDetectionStrategy.Eager (C9, Angular 22 hop) - the official
      // ng update migration's deliberate choice to preserve pre-v22 default change-detection
      // behavior without auditing whether the component's subscription-based state mutations
      // are OnPush-safe. Adopting OnPush is a separate, real behavior change, not part of an
      // Angular-version upgrade that's supposed to be behaviorally inert.
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
    },
  },
  {
    files: ["projects/demo/**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
