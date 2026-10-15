# Developer handoff — 2026-10-14, V1.1.0 candidate

Developer only: no commit/push/version increment or personal browser data access. Read INDEX/latest V1.1.0 candidate memory and role boundaries. Stable delivery remains V1.0.0. User approved >24h flow repair and launcher, then explicitly approved current-user login auto-start, superseding the earlier no-auto-start assumption. PM owns memory/release and external login-item installation.

## Findings and changes

PM restored4173 before this stage; Developer did not stop/restart that server. Static-resource-only probe and PowerShell -ServiceOnly smoke reused it successfully, without executing browser application or reading personal storage. The older server has no health endpoint and is accepted only after all13 assets match current source bytes.

Flow display already accumulated hours; completeFlow rejected elapsedHours>24, workspace validation rejected records>24h, and import normalized large hours to single-day duration. Browser flow lacked actual date segments. Completion now accepts finite positive elapsed time; both modes store actual split segments. Each segment remains<=24h, total may exceed24h and must match record hours. Daily/week/month/year statistics use real dates. Manual single-day entry still<=24h. Editing timed metadata retains actual date/time/segments/duration and rejects silently replacing them with a single-day form.

Production persistence tests exposed an additional bug: directory-session backup imported as independent user retained original sessionId, and settlement dedup removed the new user's copied record. Reproduced failing real-file regression, then fixed import normalization to omit old sessionId while retaining timeSegments and all work data. Original user's record remains intact.

Launcher checks all13 current-project assets; missing listener starts hidden detached loopback service, matching project reuses it, unknown/mismatched service reports conflict without killing it or changing port. Read-only health endpoint gives project hash/PID, no user data. Fixed link http://127.0.0.1:4173/#work-entry cannot start a stopped process itself. Login startup is current-user shortcut, service-only and hidden, no automatic browser opening. Disable checks shortcut ownership. Stop checks launcher record, health, PID/start time/node path; unconfirmed/reused legacy services are refused. Local logs/state ignored by Git.

## Verification and limits

- Complete automated suite37/37 passed. Production completeFlow at24/25/49h for browser/directory; display does not wrap.25h spans0.5/24/0.5h on three local days, with25h week/month/year totals.
- tests/long-flow-persistence.test.mjs executes actual completeFlow, save/persistData, bootstrap flushLegacy, controller and browser repository(local fallback) or directory repository. Directory handle adapter writes actual temporary disk bytes, repository closes/readbacks and reopened repository reads25h. Actual importBackup/normalization/persistProfiles plus adapter then saves/reopens two users, each retaining25h and actual segments. DOM and microtask scheduling are substituted; not a native browser directory-permission or IndexedDB test.
- Actual timeStatsFor/import/export roundtrip tested; timed metadata edit guards tested. Existing closed-gap test remains.
- Launcher isolated-port real HTTP tests cover matching reuse, foreign occupant refusal without stopping/spawning, missing-service start/readiness and cleanup of only test child. Normal4173 untouched.
- PowerShell AST parse passed; actual Windows PowerShell -ServiceOnly reuse smoke passed. Initial Node version-expression quoting failed during smoke, fixed to --version and rerun passed.
- JS syntax checks/build/git diff --check passed before freezing. Old platform/native-permission/page-lifecycle limits remain. No complete version acceptance claim.

PM subsequently reported installing the Startup shortcut, stopping PM's own old session56134 and starting PID48024 through -ServiceOnly. Reviewer reportedly verified shortcut target/Hidden argument/health PID/all13 resources/.local ownership. These are relayed PM/Reviewer observations, not Developer independent installation evidence. Actual subsequent Windows login remains unobserved. Do not terminate48024. An execution session lingering after a log is not by itself evidence of product failure.

## Installation and rollback commands

Full source checkout only, not standalone two-file ZIP:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\configure-autostart.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\configure-autostart.ps1 -Disable
```

Equivalent enable-autostart.cmd / disable-autostart.cmd. Disable affects only verified current-project login shortcut, not running service/data. start-workbench.cmd manually starts/reuses and opens browser; stop-workbench.cmd only stops verified launcher-owned service. If project moves, disable old shortcut first. Log .local/startup.log; owner record .local/server.json. No dependencies, administrator service or registry Run entry installed by Developer.

## Frozen package

dist/20261014_Beat-Workbench_V1.1.0.zip replaces10010 candidate for this iteration; all historical ZIPs retained. Exactly two root entries: 节拍工作台.html (244830 bytes), 使用说明.txt (1654 bytes). Archived HTML hash equals dist HTML.

HTML SHA256: EE9A3D5FAED0D3A2FDD2BF091ADD443328BE9082585B8F0280B8260E1D4E4FFC

ZIP SHA256: 9BEB7E99A38447873D7311ABE3A961D6CF0BD016A0533D0C4F180AAB18434589

README/CHANGELOG candidate update accompanies code; PM must synchronize latest download pointer and memory in eventual upload. No unrelated product-analysis document edited. Full independent acceptance/remote sync pending. A handoff-write tool automatic approval timed out; no action assumed completed from that timeout, retried using local patch.

2026-10-14 later storage incident investigation supersedes the frozen package/test count above. See 20261014-storage-reopen-developer-handoff.md for current44/44 result, conservative source-resolution/error/pending/exit guards and updated same-day ZIP hash. Previous37-test hash is historical evidence only, not current candidate. PM relayed pause/resume and Reviewer profile limits; no personal data operations.
