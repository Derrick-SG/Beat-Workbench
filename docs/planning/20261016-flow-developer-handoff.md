# Developer frozen handoff — 2026-10-16, V1.1.0 candidate

User-approved implementation, Designer flow-abnormal-settlement-ui-spec.md and Reviewer plan followed. Shared checkout, no agents/commit/push/version increment or4173 personal data operations. Read INDEX/memory and actual Git; unrelated product-analysis draft untouched. Memory/index and independent role reports owned by PM/Reviewer/Designer, not edited here.

## Root cause evidence

Actual global click handler blocked open-data-dialog/leave-flow-mode during saving; focused flow hides header, making recovery/export unreachable if a checkpoint writer hangs. Reproduced failing production-handler test. Existing checkpointBusy prevents reentrant checkpoints; no infinite timer queue demonstrated. This proves a code failure branch, not the user's unique original scene cause.

Controller now bounds public save wait to15s and queue to8. Original writer remains fenced until it returns; retry/source operations reject while writer still active rather than race new writes. Timeout retains candidate, does not imply IO cancellation. Late completion does not activate workspace; retry reads/verifies exact candidate before activation or retries via same protected commit lifecycle. Expired queued requests do not become late writes. Tests cover hung initial save, hung retry, queue overflow, late acknowledgment and single writer count. Epoch guard remains after writes. Recovery/export/navigation accessible during saving/stalled/error, checkpoint errors persist on visible flow page. No underlying OS process killed.

## New flow production path

App startSelectedFlow -> startDurableFlow -> controller/repository. Flow service lives in existing src/timers/sessions.js (same HTTP asset already served, no new asset-map route). Old beginSession helper remains for legacy and meeting/task paths; browser's old helper return is not the new flow start path.

Explicit project + fixed UID/workspace/profile/real start intent captured on click. Await acknowledged persistence before assigning flowStartedAt/timer; fail leaves unstarted and same intent for retry. Stored draft carries startedAt and confirm-end policy; snapshots preserve it. Browser and directory both checkpoint flow; temporary mode displays loss-of-recovery warning. Project frozen while running.

Normal completePersistedFlow commits actual segments and tasks atomically, clears runtime only after acknowledgment; retained finish intent retries same session on failure. Uncertain receipt retries verify existing record, no duplicate. Artificial minimum minute not used for new flow.

Startup unresolved flow creates forced dialog with empty datetime-local seconds/milliseconds-capable input, full timestamp/project/owner and checkpoint reference. End must be strictly later than start and<=now (zero rejected explicitly per PM). Manual settlement uses continuous start-to-confirmed-end span INCLUDING exit gap; normal segmented/meeting/task policies are not changed to full-span. Legacy start uses saved segments or minute origin, UI marks legacy precision. Record/session removal/settled ID committed together under original profile. Multiple flows processed sequentially. Export/access/retry do not skip; failure retains end field and locks submitted time until candidate verified. No default-to-now.

pagehide clears active flow runtime without auto-settling, persisted start remains. pageshow persisted re-enters mandatory confirmation; start request interrupted by pagehide cannot later activate timer directly. BFCache lifecycle test is synthetic, not a native lifecycle guarantee.

## UI review feedback addressed

Next flow resets button/focus. Validation errors stay date errors, not storage errors. Failed field focus restored after disabled state; pending candidate locks field and focuses retry with explanation. Visible checkpoint success/failure time. Reviewer native4198 found Escape closed layer while background inert; added keydown capture plus cancel prevention and close-event re-open fence while unresolved flows remain. Regression simulates unexpected native close and verifies re-opening. Real browser final Escape retest pending; do not mark this independent pass yet.

## Final evidence

node --test --test-isolation=none tests/*.test.mjs:65/65 passed. Build, all src JS syntax and git diff --check passed. PM earlier reported the pre-final64 suite pass; final queued-source/read-deadline regression increased Developer suite to65. No unrelated scope added.

New tests/durable-flow*.test.mjs execute production app UI functions with DOM substitutes and real controller/browser local-fallback repository; verify start-held/failure acknowledgment, normal4s/25h/49h, forced empty/zero/future boundaries, retained write failure/retry, multiple owner identities, export/no-skip, close/Escape guards, checkpoint policy and BFCache-like return. Service tests cover legacy interpretation, full-span vs actual segments, idempotence/uncertain receipt.

Directory test uses actual temporary disk files with native-handle adapter, repository close/readback and fresh controller: start timestamp/project survives,25h manual settlement survives reopen, owner/other-user tasks preserved, day/week/month/year boundaries across New Year match, repeated settlement stays one. No native OS picker/permission lifecycle claim. Earlier independent reports/real UI observations are distinct from these substitutes. No browsing/desktop work or real user folder accessed by Developer this phase.

## Frozen candidate

20261016_Beat-Workbench_V1.1.0.zip retained alongside prior dated packages. Exactly two root entries: 节拍工作台.html269872bytes; 使用说明.txt2192bytes. Archived HTML hash compared with current dist, equal. README/CHANGELOG point at16-day local candidate and explain updated accounting. Version remains candidate1.1.0, stable deliveryV1.0.0. No upload authorized here; PM owns memory/release.

HTML SHA256: 982FA4FCC53BACE06A8066E8C53DD17EAACA0F7F88A095F0E36E539455D4C40D

ZIP SHA256: 57A9497E08BF146D09329E0DED27C96D96893399F1163EA753B73DC0F09208CE

Remaining: Reviewer real Escape/modal/focus final retest and Designer final rendering, prior full native-platform limitations, original personal incident integrity/unique root cause unconfirmed. Do not automatically merge/reset/overwrite user data or claim old missing records recovered.

Final controller boundary correction: returnToBrowser/useOriginalBrowserData reject when requests are queued as well as in flight, preventing an await-tail hang before writer activation. An active pre-save read that returns after deadline cannot launch a subsequent file write. Regression observed red, then full65/65 passed; final HTML/ZIP hashes above supersede the earlier64-test interim build. No product changes after final build/package.
