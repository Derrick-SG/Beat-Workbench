# Developer recovery delivery

2026-10-08. Scope: source recovery only; no product redesign, features or historical bug fixes.

## Changes

Mechanically extracted the original inline stylesheet/module into src/styles.css and src/app.js. src/index.html is the HTTP source entry. Added Node built-in-only static server, standalone packer, package metadata, tests and Chinese README. Reference files remain untouched. No packages installed, no commits/push/publishing performed, no other role's reports edited.

## Execution record

- Missing-source test first failed with `editable application source is missing` before extraction.
- Default Node test isolation initially hit sandbox `spawn EPERM`; the test runner now uses `--test-isolation=none` and the build test calls the real exported build function in-process.
- Existing Node is v24.19.0; npm and Python are unavailable. All deliverable commands use Node directly; npm scripts are optional conveniences.
- `node --test --test-isolation=none tests/*.test.mjs`: 7 passed, 0 failed.
- Tests run real import/export/normalization/statistics functions in a VM, substituting browser I/O/UI boundaries. JSON v3 full supported field round trip, legacy arrays, existing user preservation, malformed/empty input, truncation and overlap accounting are covered.
- HTTP test starts a real loopback server, retrieves actual source assets, checks MIME/content and rejects non-assets and writes.
- Reassembled dist/节拍工作台.html is byte-for-byte identical to the supplied baseline. This covers CSS cascade, HTML, business script, key names, templates and event-handler order without relying on a visual guess.

## Limits and handoff

Reviewer R1–R8 remain inherited risks, documented in README. No claim of browser lifecycle, Office rendering, actual user data migration or full product acceptance is made. Independent Reviewer should inspect the delivered source/standalone entry and perform the PM-approved browser/Office checklist, explicitly separating inherited failures from recovery regressions.

Plan ruling: keep work in the user-requested shared checkout, with no automatic worktree creation or commits of PM/Designer/Reviewer untracked files. Reviewer coordination stays with PM as explicitly instructed. This delivery is Developer implementation evidence, not a version acceptance announcement.
