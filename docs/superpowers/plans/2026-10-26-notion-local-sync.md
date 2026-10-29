# Notion Local Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. User already authorized inline continuous implementation, not another execution-mode question.

**Goal:** V1.1.2 historical import and automatic current-user one-way Notion sync, keeping local saves independent.
**Architecture:** Browser publishes complete committed snapshots; authenticated loopback API durably queues them; private single-worker journal reconciles Notion structure/pages/managed content. History and incremental sync share identity and journal.
**Tech Stack:** Node >=22 ESM built-ins, existing browser modules, no added dependency.
**Spec:** docs/superpowers/specs/2026-10-26-notion-local-sync-design.md (approved fa30b6c).

## Global constraints

- D:/BaiduSyncdisk/Codex/Beat-Workbench explicit shared checkout, current1.1.1 target1.1.2. No real4173 or personal-data tests, real Notion bulk write or upload. PM owns memory/PRD; keep historical ZIPs.
- Private token/state in LOCALAPPDATA/Beat-Workbench/notion, outside project/Baidu sync. Windows current-user ACL, console hidden token input, no HTML/Git/ZIP/log token. Process mutex and atomic state replacement.
- Exact 127.0.0.1 Host/Origin and per-process random X-Workbench-Token; reject null/absent Origin writes; JSON <=8MiB, profile <=10000 tasks/records each, journal<=32MiB. Capacity failure visible, never block local commit. Notion host fixed, 20s timeout, serial worker, Retry-After/capped backoff up to5min.
- Complete snapshots include scope/revision; old or same-revision different payload rejected. Only confirmed binding can send, user switches pause old scheduling. No avatar/session/pending upload. Startup reconciliation fills post-save/pre-enqueue crash gap; closed browser only drains accepted queue.
- Persist create intent before POST. Unknown row/DB/block creates only reconcile paginated source/structure/content markers; absent/duplicate results pause, never blind repeat POST. Explicit retry reads again. Preserve Notes and removed-source rows, never remote delete/archive.
- Long text/segments become <=1800char managed paragraphs, <=50 blocks per batch, markers/hashes distinguish updates and uncertain append. Reject oversize explicitly instead of truncation. Extract exact existing overlap/day/project allocation statistics.

## Review focus

Unknown successful POST/restart must not duplicate (2/3); partial/old snapshots cannot remove unrelated rows (1/2); saved commit resolves despite offline sync(4); scope switch cannot route to another user/target(2/4); long content cannot truncate/append duplicate(1/3).

### Task1 Shared projection/statistics
Files: src/model/time.js,src/app.js,new src/sync/projection.js,tests/notion-projection.test.mjs.
Interfaces: timeStatsFor(records) shared unchanged algorithm; projectSnapshot(snapshot) ordered project/task/record entities. Stable scoped deterministic project UUID/digest, trim-only names, separate system-unclassified namespace; no inferred rename.
- [ ] Write failing overlap/scope/placeholder/large-content tests; observe red.
- [ ] Implement projection validation and extraction without changing local model identity or time rounding.
- [ ] Run projection and time regressions.

### Task2 Private journal/worker
Files:new scripts/notion/store.mjs,engine.mjs,tests/notion-engine.test.mjs.
Interfaces: openStore(dir) lock/atomic save; createSyncEngine({store,client,clock}) status/check/preview/importSnapshot/acceptSnapshot/pause/retry/tick/close. Journal binding/accepted revision/hash/page mapping/content/intents/backoff.
- [ ] Red tests: restart/offline/revision/delete-retain/scope/unknown create.
- [ ] Implement durable coalesced snapshots and serial worker; write intent before mutation; record remote result before moving queue; reconcile unknowns read-only.
- [ ] Verify idempotent import, stale rejection, Notes retained and no remote delete.

### Task3 Adapter/configuration
Files:new scripts/notion/client.mjs,configure.mjs,configure-notion.ps1,tests/notion-client.test.mjs.
Interfaces:createNotionClient({token,parentPageId,fetchImpl}) parent check, marked structure find/create, SourceKey page query/upsert, managed content find/update/append. Pin2025-09-03 data-source API, validate returned IDs/schema.
- [ ] Red fake HTTP tests401/429/timeout/pagination/partialDB/unknown content.
- [ ] Implement safe errors/backoff, project relations, dedicated Notes untouched; marker-based DB and content lookup before mutation/retry.
- [ ] Hidden local setup via PowerShell secure input then environment process handoff; private ACL, no secret outputs. No real calls during tests.

### Task4 Loopback/browser
Files:scripts/serve.mjs,src/storage/controller.js,src/bootstrap.js,new src/sync/notion.js,tests/notion-server.test.mjs,tests/notion-bridge.test.mjs.
Interfaces:GET/api/notion/session,/status; POST/check,/preview,/import,/snapshot,/retry,/pause with authenticated same-origin JSON. Service lazy and closed with HTTP server.
- [ ] Red testsHost/Origin/token/body and asynchronous saved-event hook.
- [ ] Add success subscription commit/retry/initialization/source changes. Fire-and-forget bridge, retry saved snapshot on startup/online; sync failure visibly separate from local failure; no pending upload.
- [ ] Management UI: target link/current user/P,T,R counts/status; connection check, one create-and-first-sync action (no secondconfirm), daily sync/retry/pause; no web token field. Unknown remains reconciliation state. File standalone truthfully unavailable.
- [ ] Temporary-port HTTP/security/bridge regression only; actual4173 untouched. Document service restart required for new routes.

### Task5 Version/package
Files:package.json,asset map,README,CHANGELOG,Developer handoff,dist/20261026_Beat-Workbench_V1.1.2.zip.
- [ ] Run relevant then full regressions; retain actual Notion integration limitation until user config/synthetic real test.
- [ ] Build version1.1.2/source+standalone footer; verify ZIP whitelist/HTML hash/no private config and old files preserved.
- [ ] Document hidden setup/first import/offline/unknown/capacity/test limits; freeze to Reviewer/Designer. No commit/push.

## Execution ledger
2026-10-26 plan: user-approved design, inline execution expressly authorized; preserve shared checkout for project roles, commits/uploads by PM. D write authorization requested through tool because current sandbox lists old C roots; do not use empty C project. Ruling: package commit only after independent review, no native credential or Notion operations during development.
