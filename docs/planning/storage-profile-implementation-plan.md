# Storage and profile implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task, retaining Developer/Designer/Reviewer role separation. Steps use checkbox tracking. User reviews this plan before execution; PM coordinates independent review.

**Goal:** Add editable names/avatars and optional directory persistence with honest browser fallback, safe migration and recoverable timers.
**Architecture:** Separate pure data/profile rules from asynchronous browser/folder repositories, a serialized workspace controller and timer sessions. The existing app consumes a validated workspace only after bootstrap; UI changes follow Designer's approved design. ES modules serve over HTTP and a deterministic dependency-free packer embeds them into one module script for standalone delivery.
**Tech Stack:** Existing Node 22+, browser ES modules, IndexedDB, localStorage legacy reader, File System Access, Canvas; no installed dependencies.
**Spec:** `docs/planning/storage-profile-spec.md` (2026-10-09, including checkpoints/fallback/copy protection/profile commit amendments).

## Global Constraints

- 不增加服务器、云同步、登录或桌面程序，不合并苹果字体需求，不全面修复原版历史缺陷。
- 基于真实能力检测启用目录模式，不仅按浏览器名称判断。
- 一个目录对应整个工作台，包含全部用户资料、记录、任务和当前用户标识；目录配置是应用级，不随用户切换。
- 保留旧浏览器数据，不自动删除。目录副本成功写入前不能显示保存成功。
- 心流、会议或任务追踪计时进行中禁止切换数据源。
- 资料保存成功后才正式生效；失败保留原正式资料与草稿。
- JPEG/PNG/WebP only; input ≤5 MB and ≤16,000,000 decoded pixels; center crop 256×256; output ≤200 KB; neutral background, no original metadata.
- Display circles 28/36/72 CSS px and hit areas ≥44×44 CSS px are project values; Designer owns visual review.
- Legacy v3 and array import stay supported; no automatic data merge. Directory session checkpoints every 15 seconds while page execution permits; closed-page time never counts.
- Current delivery remains V1.0.0; V1.1.0 is proposed, not enacted here. Preserve reference and historical releases. No commits/push in this plan-only stage; implementation upload batches follow AGENTS memory/Reviewer rules.

## Review Focus

1. Browser suspension/restart around a timer save: use only successful checkpoint time, no closed interval (Task 4).
2. Permission revoked after a write opens: official state stays unchanged; reconnect/export remain possible (Tasks 2–3).
3. External edit between conflict check and write: disclose limits, avoid overwrite when detected (Task 2 plus real-browser review).
4. Oversized/malformed image and encoded backup avatar: old metadata stays intact (Task 1 and browser review Task 5).
5. Quota failure while switching to browser: original browser recovery copy and active directory remain usable (Task 3).

## Files and shared contracts

Create `src/model/workspace.js`, `src/profile/avatar.js`, `src/profile/editor.js`, `src/storage/browser.js`, `src/storage/directory.js`, `src/storage/settings.js`, `src/storage/controller.js`, `src/timers/sessions.js`, `src/bootstrap.js`; integrate `src/app.js`, `src/index.html`, `src/styles.css`. Each module exports named functions only, using explicit relative static named imports. No external imports, dynamic imports, re-exports or top-level DOM effects outside bootstrap/app.

Data contracts (plain JSON; no handles/object URLs):

- `Workspace = {format:'Beat-Workbench/workspace',schemaVersion:1,workspaceId:string,revision:integer>=0,updatedAt:ISO,activeProfileId:string,profiles:Profile[],sessions:Session[],settledSessionIds:string[]}`.
- `Profile = {id:string,name:string,avatar:null|{mime:'image/png'|'image/jpeg',dataUrl:string},records:Record[],tasks:Task[]}`. Existing record/task field meanings and legacy normalization remain unchanged; reject corrupt workspace rather than normalize it into emptiness. Unique IDs/names, valid active ID and supported schema required. Unknown workspace version is read-only error. Avatar bytes must match declared raster signature, decode limits and size.
- `Session = {id,workspaceId,profileId,kind:'flow'|'meeting'|'task',elapsedMs:number>=0,checkpointAt:ISO,status:'paused'|'running',draft:object}`. Draft retains original project/category/task IDs and kind-specific fields needed to finish once. IDs generated with crypto.randomUUID with collision-resistant fallback; all refs validated. Settled IDs retained without truncation in this iteration, document growth.
- Single-user backup v4: `{app:'节拍工作台',version:4,exportedAt,profile:{name,avatar},records,tasks}`; sessions excluded. Import v3/array supplies null avatar and new independent profile ID. Reject unknown newer backup versions; export preserves fields, old app cannot retain avatar on re-export.
- `SaveReceipt = {workspaceId,revision,savedAt}`; `StorageError.code` is one of permission/missing/invalid/unsupported/conflict/quota/io. Distinguish missing file from blank bytes.
- `Repository`: `load():Promise<Workspace|null>` (null only genuinely missing), `save(candidate:Workspace,expectedRevision:number|null):Promise<SaveReceipt>`, `flush():Promise<void>`; errors never return default workspace. First save increments revision from 0; controller stamps updatedAt and repository serializes the exact candidate.
- `SourceState = {mode:'browser'|'directory',phase:'resolving'|'loading'|'ready'|'reconnect'|'saving'|'error'|'conflict',directoryName?,lastReadAt?,lastSavedAt?,dirty:boolean,error?}`.

## Task 1: profile rules, avatars and portable data

**Files:** create model/workspace.js, profile/avatar.js, profile/editor.js; create tests/profile.test.mjs and tests/workspace.test.mjs; modify tests/data.test.mjs for v4 tests, preserving all existing statistics assertions.
**Interfaces:** model exports `validateWorkspace(value):Workspace`, `readLegacyBrowser(storage):Workspace|null` (read-only), `parseProfileBackup(value):{name,avatar,records,tasks}`, `makeProfileBackup(profile):object`. editor exports `validateName(name,profiles,profileId):string` and `saveProfileDraft(controller,profileId,draft):Promise<SaveReceipt>`. avatar exports `prepareAvatar(file):Promise<Avatar>` and `validateAvatar(avatar):Promise<Avatar|null>`; actual image decode/re-encode uses browser Canvas, not a fake Node image decoder.

- [ ] Write failing tests: rename trim/name collision/empty/31 chars, stable ID and records after rename; rejected repository save leaves official profile unchanged and draft available; v4 name/avatar/records/tasks roundtrip; v3/array default avatar; unknown version and invalid workspace throw. Use hand-written synthetic fixtures with two users and 1.5h record; no production data.
- [ ] Run `node --test --test-isolation=none tests/profile.test.mjs tests/workspace.test.mjs`; verify failures are missing behavior, not test setup errors.
- [ ] Implement pure contracts and legacy read without writes. Profile draft saves a cloned candidate through controller contract; changes official profile only on successful receipt (inject a minimal contract double until Task 3 exists).
- [ ] Implement raster sniff/decode/size checks, centered crop over neutral canvas and JPEG re-encode with bounded quality attempts. Verify output size; reject if still too large. Revoke temporary object URLs in finally. Limits apply on upload and v4/workspace import, not only file picker accept attribute.
- [ ] Run targeted tests green and full existing suite. Add actual-browser checks of PNG transparency, portrait/landscape, WebP, disguised SVG, bad bytes, >5 MB and >16M pixels to Task 5 matrix; assert thumbnail 256×256 and prior profile preserved on rejection.

## Task 2: durable repositories and build plumbing

**Files:** create storage/browser.js, directory.js, settings.js; modify scripts/build.mjs, serve.mjs and tests/server.test.mjs, recovery.test.mjs; create tests/storage.test.mjs and tests/build.test.mjs.
**Interfaces:** browser exports `createBrowserRepository(indexedDB):Repository`, `readBrowserRecovery():Promise<Workspace|null>`, `preserveBrowserSnapshot(workspace):Promise<string>`. settings exports `readSourceSettings():Promise<{mode,handle?}>`, `writeSourceSettings(settings):Promise<void>` storing handles via structured clone in IndexedDB. directory exports `detectDirectorySupport():boolean`, `pickDirectory():Promise<Handle>`, `queryAccess(handle):Promise<'granted'|'prompt'|'denied'>`, `requestAccess(handle):Promise<boolean>`, `createDirectoryRepository(handle):Repository`, `readPreviousSnapshot(handle):Promise<Workspace>`.

- [ ] Write failing contract tests with controllable file/transaction boundaries: absent vs empty/corrupt/new schema; rejected permission; close rejection; save 2 cannot be overwritten by delayed save 1; external revision/fingerprint conflict; failed backup prevents primary overwrite; previous snapshot remains valid after failed primary write. Browser transaction abort must retain previous current/recovery snapshot. No assertions merely that a mock method exists.
- [ ] Run storage tests RED. Implement IndexedDB database `beat-workbench`, version 1, stores `workspaces` (key current plus recovery), `settings` (source), single transaction for browser current+recovery transitions. Legacy localStorage keys untouched. IDB unavailable -> explicit legacy browser mode; use a single-key versioned localStorage snapshot with bounded prior snapshot only where writes succeed; quota failures surface. Neither unavailable -> labelled temporary session, never durable success.
- [ ] Directory layout: only `beat-workbench.workspace.json` and `beat-workbench.previous.json`. Before replacing existing valid primary, validate it and successfully write/close its bytes into previous; then write/close candidate primary and re-read/validate identity/revision/content. Keep exactly one previous snapshot. If primary is invalid, never overwrite it automatically; previous recovery requires preview and explicit confirmation. Missing primary initialization follows Task 3 confirmation. Partial-file or close errors stop automatic writing, retain candidate in memory and allow export.
- [ ] Use same-origin Web Locks exclusive workspace writer lock for live directory editing plus BroadcastChannel status. If lock facility unavailable, expose directory read/reconnect but do not permit unprotected directory edits; browser mode remains available. Compare last-read revision and fingerprint immediately before writing. This is cooperative protection, not cross-origin/process atomic compare-and-swap. Confirm external-edit race remains documented for Reviewer.
- [ ] Write build tests RED: generated HTML contains executable assembled module and no external runtime modules; roundtrip module source with literal `$`/Unicode; missing/cyclic/unsupported import fails build. Keep original reference SHA256 assertion; replace only intentional current-dist-equals-old-baseline assertion.
- [ ] Implement deterministic static module assembly: parse constrained import/export declaration syntax, topologically order module factories in one embedded module script, bind named imports to namespace objects, preserve module scope. Reject unsupported syntax/cycles; no regex stripping arbitrary JavaScript. Serve only explicit source module allowlist with correct MIME and no filesystem traversal. The original CSS/UI remains source-driven.
- [ ] Run targeted storage/build/server tests and full suite GREEN. Compare archived V1.0.0/reference hashes unchanged. Record new runtime module graph for Reviewer.

## Task 3: source controller, migration and UI integration

**Files:** create storage/controller.js, bootstrap.js; modify app.js/index.html/styles.css and profile/editor.js; create tests/controller.test.mjs and docs/planning/storage-profile-developer-verification.md during implementation.
**Interfaces:** `createWorkspaceController({browserRepo,settings,directoryFactory,onState}):Controller` with `initialize()`, `getWorkspace()`, `getState()`, `commit(update:(Workspace)=>Workspace):Promise<SaveReceipt>`, `flush()`, `previewDirectory(handle):Promise<{kind:'empty'|'existing',workspace,summary}>`, `activateDirectory(preview,confirmation):Promise<void>`, `returnToBrowser(confirmation):Promise<void>`, `useOriginalBrowserData(confirmation):Promise<void>`, `retry():Promise<void>`. Every queued operation captures source generation/workspace/profile ID; commit never accepts mutable shared app arrays.

- [ ] Write failing tests for startup load before initialization, no default write on read error, empty-directory migration only after confirmation, existing directory no merge, cancelled/rejected migrations preserving source/users, read-back mismatch, stale queued operation after user/source change, browser-original fallback with source/time disclosure, quota during browser return preserving both sources. Official profile save rejection from Task 1 now tested against real controller.
- [ ] Run controller tests RED; implement controller single queue and staged candidates. Stop queue on conflicts/errors rather than attempting silent overwrite. Persist source activation only after validated target write/load; a settings failure keeps old selection and reports error. Original browser fallback does not write directory or replace remembered configuration without confirmation.
- [ ] Returning from loaded directory: show both summaries, preserve existing browser workspace as recovery, then save current directory snapshot into browser current in one IDB transaction where supported; only switch source after success. localStorage fallback prepares recovery first and publishes single current key last; failure never activates new source and recovery stays available. Disclose no multi-key atomicity.
- [ ] Bootstrap disables mutations until initialize resolves. Split existing startup into controller initialization then app bind/render; eliminate startup default writes when a selected directory is unresolved. Adapt every save/import/new user/edit/delete/task/rename path to controller promises and captured IDs; retain existing data/statistics/report behavior. Disable conflicting user mutations while a pending save exists; use official workspace on rejection and keep draft for retry/export.
- [ ] Implement Designer-specified controls for profile draft, folder preview/confirmation, reconnect, original browser fallback, restore previous snapshot and pending/error/conflict state. Missing/unsupported API gets browser/manual backup description. Guard source changes for active timers and dirty forms; profile drafts require save or explicit discard. Preserve keyboard focus, text escaping and declared avatar/hit sizes.
- [ ] Run controller/profile/data tests and full suite GREEN; record basic browser CRUD/reload, two-user names/avatars, import/export and failure behavior for independent review. No feature success claim without these checks.

## Task 4: three timer session checkpoints and exact-once completion

**Files:** create timers/sessions.js; modify app.js/controller.js integration; create tests/sessions.test.mjs.
**Interfaces:** `createSessionManager({controller,clock,setInterval,clearInterval}):{start(kind,profileId,draft),checkpoint(),pause(),restore(sessionId),discard(sessionId),complete(sessionId,makeRecord),hasActiveSession()}`; mutation methods return Promises except read-only predicate. complete callback receives `{sessionId,profileId,elapsedMs,draft}`. Add optional `sessionId` on generated logs; backup/import retains it where present.

- [ ] Write failing fake-clock tests for all flow/meeting/task kinds: checkpoints at 15s, restore after a simulated 1h closure counts 15s not 3615s, discard yields zero records, completing twice yields one record, failure after disk commit before UI acknowledgment then reload yields one record, stale profile selection cannot change record owner, checkpoint failure preserves previous successful elapsed time.
- [ ] Run sessions tests RED; implement serialized checkpoints in directory mode at 15,000ms, including draft edits at next checkpoint. Background throttling/suspension can delay execution; state this limit rather than promise OS-level scheduling. Running elapsed time uses active monotonic clock accumulation; restored sessions always paused until explicit resume. Never add time since stored checkpointAt on reopen.
- [ ] Finish operation saves record, settledSessionIds update and session removal in one workspace candidate. Re-read after uncertain failure before retry; if ID is already settled, load official result without appending. Keep unfinished draft if commit failed. Discard removes pending session with no record and waits for save.
- [ ] Replace directory-mode exit completion with proactive checkpoints; unload is not an awaited save guarantee. Retain browser mode behavior except required safe identity/commit integration; source changes blocked for all three kinds, never clear timers as a side effect of denied switch.
- [ ] Run sessions tests and full suite GREEN. Add actual-browser restart with flow/meeting/task, permission revoked during completion, duplicate retry and closed-time assertions to Task 5 matrix.

## Task 5: regression, actual-browser checks, documentation and candidate packaging

**Files:** update README.md and package scripts only as required; add docs/planning/storage-profile-browser-matrix.md; update developer-verification.md; build current dist/节拍工作台.html; create a separately named candidate ZIP after PM confirms version/date. Historical dist/20261008_Beat-Workbench_V1.0.0.zip remains untouched.
**Interfaces:** consumes all prior modules and public app UI; produces evidence, runnable source and standalone candidate, not independent acceptance.

- [ ] Run `node --test --test-isolation=none tests/*.test.mjs`, `node --check src/app.js`, `node scripts/build.mjs`; require zero failures and no external runtime dependencies. Verify source module syntax and standalone script parse.
- [ ] Execute Developer browser matrix with synthetic data: desktop Chrome and Edge HTTP directory actual selection, authorized reopen/reconnect/deny/cancel; valid/empty/corrupt/newer snapshot; queued saves/conflict/timer restarts; v4/v3/array and image boundaries. Record browser/version, URL, steps, actual disk bytes and timestamps, not only permission API doubles. If tooling cannot select a real directory, report blocker/untested item rather than simulate a pass.
- [ ] Check standalone file opening separately in actual Chrome/Edge; unsupported Safari/mobile use browser mode/manual JSON. Test Safari and one mobile browser where available; otherwise explicitly untested and hand to Reviewer. No HTTP-to-file or desktop-to-phone inference.
- [ ] Regress original quick CRUD, backfill, pending tasks, overlapping duration, daily/week/month/year reports, copy, Word/PPT/print entry paths; preserve original reference hashes. Real Office layout remains its own Reviewer limitation, not an implied pass.
- [ ] Document capability matrix, stable origins, manual fallback, migration/all-user workspace versus per-user v4 backup, permission recovery, previous snapshot, dirty writes, 15s best-effort checkpoint and closed-time rule, avatar limits and old-app loss of avatar. No personal avatars/data in repo/ZIP.
- [ ] Produce synthetic-data-free ZIP with HTML and Chinese instructions, verify exactly two root entries and HTML hash matches current build. Date uses actual Asia/Shanghai release date and PM-confirmed V1.1.0 if approved; do not overwrite V1.0.0.
- [ ] Hand evidence to Designer and independent Reviewer via PM. Resolve Developer defects with failing regression tests before fixes. PM alone confirms acceptance/release. Before any approved GitHub upload PM writes cumulative new-version memory and INDEX, Reviewer checks file/evidence consistency, and memory+code share one commit; remote status stays pending until actual remote commit verification.

## Self-review and handoff (plan-only)

Coverage: profile rules/images/backups Task 1; repository formats/previous snapshot/locks Task 2; bootstrap, migration, fallback, copy protection and official-state save Task 3; all three timers/15s/closed time/discard/dedup Task 4; real-browser boundaries, UI coordination, packaging/regression Task 5. Shared type names and interfaces are consistent. Task 1 editor consumes Task 3 Controller through a test contract until integration; no dependency cycle. Tests derive field/time expectations from literal synthetic fixtures; real permission and image decode results are not claimed from doubles. Reference and historical ZIP stay immutable. No unresolved implementation placeholders; environment availability and version approval are explicit external gates.

Spec status wording still says awaiting written review; PM's latest instruction confirms its target for planning, but explicitly requires user review of this plan before implementation. Preserve original collaborative execution: Developer implements, Designer checks design, Reviewer independently validates, PM releases. No new subagent model/execution choice is needed.

## Implementation amendments (2026-10-09)

Reviewer requested and Developer implemented in the candidate: timeSegments on new timer records and local-day expansion for report statistics; damaged-primary byte preservation plus explicit repair/retry; independent append-only browser recovery snapshots and selection UI. Validate ID/date/time/image data before activation and re-read directory at confirmation. Test first, observed regressions and repaired; see progress and verification documents. These amendments refine the approved plan without new features or broad historical bug fixes. No release/commit acceptance is implied.
