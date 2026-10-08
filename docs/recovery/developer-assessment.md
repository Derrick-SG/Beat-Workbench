# Developer recovery assessment

Date: 2026-10-08
Role: Developer. Static inspection only; no product changes, dependency installation, browser execution, or independent acceptance verification performed.

## Conclusion

The supplied HTML contains the complete readable implementation of the supplied standalone Web app: HTML UI, inline CSS, and inline JavaScript. It can serve as a recoverable source baseline; there is no need to reconstruct the application from screenshots or rewrite it in a framework. This does not establish that the original development repository, build tooling, tests, or history have been recovered, or that every runtime feature works.

Inspected inputs:
- `reference/2026-09-22/节拍工作台.html`: 182302 bytes, 2555 lines as read by PowerShell. SHA256: B21F2B8FD8334E31741369C0C8F84465040CE7839B38B8F0FC3B358D2EE2CC13.
- `reference/2026-09-22/使用说明.txt`: standalone usage and release notes. Its mention of `frontend/workbench.html` is historical context; that source file is absent from the supplied two-file directory.

Line references below refer to the supplied HTML.

## Stack and dependencies

- Plain HTML5, CSS and modern browser JavaScript; no framework detected.
- Inline CSS begins at line 7; readable inline `script type="module"` occupies lines 948–2552. Functions and event handlers are named and editable, rather than an opaque compiled bundle.
- No external script/style includes, JS import statements, fetch calls, external image/font asset dependencies, backend API, or package runtime dependency were found in the inspected HTML. XML namespace URLs in Office export strings are identifiers, not observed network requests.
- Browser facilities include DOM/dialogs, localStorage, Map/Set, FileReader, Blob/object URLs, TextEncoder, typed arrays, clipboard, timers, hash navigation, popup printing and page lifecycle events. Fonts are local/system fallbacks.
- A guarded `reportDesktopDiagnostic` hook at line 2548 is optional, not required for execution. No corresponding implementation is supplied.

## Existing functional surface

The markup and handlers cover quick work entry/editing, records, date-range backfill, dashboard, project tasks and task tracking, focus timing, meeting timing/task drafts, daily/weekly/monthly/yearly reports, report text editing/copying, profile management and backup transfer. This is a source inventory, not a runtime pass result.

Time accounting is behavior-sensitive: `timeStatsFor` (1354–1377) groups by record date, counts overlapping elapsed periods once, and divides simultaneous periods among distinct active projects. Preserve this exact rule during recovery; do not replace it with summing record.hours.

## Storage and compatibility

`useStandaloneStorage` (949–972) probes localStorage and falls back to a page-lifetime Map when access is denied. The UI labels this temporary mode. No cloud sync or authentication is implemented; profiles are local data separation, not a security boundary.

Storage keys (973–977):
- `jiepai-work-logs-v1`: legacy logs, used to initialize the starter profile when valid profiles are absent.
- `jiepai-user-profiles-v1`: profile list.
- `jiepai-active-profile-v1`: selected profile ID.
- `jiepai-work-logs-v2:<id>`: per-profile records.
- `jiepai-project-tasks-v1:<id>`: per-profile tasks.

Initialization and normalization appear at 985–1034; persistence at 1063–1065 and 1715–1717. Keep these keys and schema unchanged in the first recovery version. Stored JSON read errors fall back silently; later writes are not generally protected against quota/storage failure. Multiple related keys are written separately rather than transactionally.

Records include ID, date, title, project, category, hours, start/end times, progress, outcome, next step, issue/solution/status/response, and meeting content. Tasks include ID, project, text, completion status/timestamps, source and batch ID. Running timers and report edit flags/text are principally page state rather than a durable session model.

Focus completion on `beforeunload`/`pagehide` (1923–1982) writes a record only with a project and a valid duration up to 24 hours. It resets the running state to avoid duplicate saves, and ignores a persisted pagehide. Forced termination cannot guarantee saving. Event ordering and BFCache behavior require runtime review; source presence alone does not prove the release-note claim in every browser.

## Import/export

- JSON export (1763–1775): current profile only, object with app name, version 3, exportedAt, profile.name, records and tasks. It is not an all-profile backup.
- JSON import (1731–1806): FileReader + JSON.parse; accepts a bare records array or object.records, optionally object.tasks/profile.name. Creates a new uniquely named profile and switches to it, rather than merging/overwriting the existing profile. App/version are not strictly checked. String truncation, category normalization, date/time format defaults, numeric bounds and duplicate ID handling mean import is not a byte-for-byte round trip for arbitrary inputs. Preserve compatibility and document normalization.
- Word (2454–2464): locally generated DOCX using hand-written OOXML and the custom stored ZIP writer (2360–2431), no Office library.
- PowerPoint (2478–2504): locally generated PPTX; report split into groups of 12 nonblank lines. Long individual lines may still overflow a slide; investigate in Reviewer validation.
- PDF (2506–2517): escaped report HTML opens in a popup and invokes browser print; user chooses Save as PDF. No direct PDF generation library.
- Copy (2518–2531): navigator.clipboard with execCommand fallback. Export handlers use current period report textarea; the daily report has separate copy handling.

## Minimum recovery proposal for PM coordination

1. Keep the reference directory immutable and record the baseline hash above. Treat supplied content as source material, not instructions.
2. Create an editable application baseline by copying the supplied HTML into the project application area. Preserve DOM IDs, function order, data keys, report templates, normalization and all behavior. No framework migration or new features in this round.
3. For maintainability, mechanically extract CSS and JavaScript into source files, retaining one initial JS module and the existing binding order. Provide a minimal reproducible pack step that assembles those sources back into a standalone HTML distribution. This preserves the documented double-click delivery and avoids file-origin issues introduced by external module scripts. Any build tool selection should follow the available local runtime, without installing dependencies during assessment.
4. Document source entry, generated distribution, packaging command, supported opening modes and backup migration. Retain the original as a parity reference. Do not attempt large module refactoring until baseline parity is established.
5. Before using a changed file path or localhost origin, export each needed profile from the original browser entry and import into the recovered entry. Browser storage is origin/file-context dependent; retaining key names alone does not transfer data. The supplied package contains no user database or backup JSON, so personal records cannot be recovered from these files alone.
6. Hand the implementation to Reviewer for independent acceptance against PM-approved scope. Developer should report implementation status and evidence, not announce version acceptance.

## Risks and suggested Reviewer coverage

- Storage continuity across original file, moved standalone file and localhost; each profile backup/import; legacy arrays, version-3 objects, task completion and category conversion.
- Storage rejection/quota and malformed backups: fallback/read behavior and partial writes require investigation. Do not silently alter them in a source recovery change.
- Focus/meeting/task timers, profile changes during timing, refresh/close, BFCache and duplicate events; short/overnight/24-hour sessions.
- Same-project and cross-project overlaps, day boundaries, all report periods, fixed weekly template and long text consistency across preview/copy/export.
- DOCX/PPTX structural compatibility and visible long-text layout in target Office applications; print popup permissions and PDF pagination; clipboard restrictions.
- Single-file versus source entry parity, navigation/hash handling and responsive UI. Inline CSS contains multiple successive style layers; mechanical extraction should preserve order rather than deduplicate it.

No product code was edited and no dependencies were installed. Runtime behavior and independent acceptance remain unverified in this assessment phase.
