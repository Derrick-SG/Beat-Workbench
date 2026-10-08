# Workbench recovery implementation plan

> Execute inline with executing-plans; PM arranges independent Reviewer acceptance.

**Goal:** Preserve the supplied UI and functions in an editable, locally runnable source project with reproducible standalone packaging.
**Architecture:** Mechanically move the sole inline stylesheet and module into `src/styles.css` and `src/app.js`; `src/index.html` references them. A Node built-in-only packer restores the original inline boundaries. A loopback static server serves only source assets.
**Tech stack:** Existing Node 24, browser HTML/CSS/JavaScript; zero installed dependencies.
**Spec:** User-approved scope and `developer-assessment.md`, `reviewer-assessment.md`, project `role-boundaries.md`.

## Constraints and rulings

- Keep reference files byte-for-byte unchanged; preserve storage keys, templates, schemas, timing/statistics and normalization.
- No new product features or historical bug fixes. No dependency installation.
- Work in the shared project checkout as requested; do not move the PM's untracked reference/reports into a different checkout or commit other roles' work.
- Reviewer risks R1–R8 are inherited and must remain explicitly distinguished from recovery regressions.

## Task 1: source and tooling

- [x] Write `tests/recovery.test.mjs`: missing source/packer must fail; assembled output must equal reference bytes and source script must parse.
- [x] Run the missing-source test and record the failure.
- [x] Extract `src/index.html`, `src/styles.css`, `src/app.js` without changing embedded content; implement `scripts/build.mjs`, `scripts/serve.mjs`, `package.json`.
- [x] Verify real build output, HTTP source delivery, missing paths and traversal rejection.

## Task 2: data contract and handoff

- [x] Exercise existing normalization/import/export functions with legacy arrays and v3 objects in a Node VM test harness; assert record/task fields, independent profiles, existing-profile preservation, export/reimport and malformed input.
- [x] Pin overlap accounting and overnight duration to hand-derived values.
- [x] Write README with source/start/build/test commands, per-user JSON migration and inherited limitations.
- [x] Run full tests, build, syntax check and original hashes; save developer delivery evidence. Independent browser/Office acceptance remains with Reviewer.

## Review focus

file-to-HTTP storage isolation; timers and BFCache; storage quota/partial writes; import truncation/normalization; Office long-text layout. Automated checks cover build parity, representative JSON paths and time accounting; real browser lifecycle/storage failures and Office rendering remain explicit Reviewer work.
