# Developer storage reopen handoff — 2026-10-14, V1.1.0 candidate

This is the latest Developer freeze and supersedes the37-test package/hash in 20261014-developer-handoff.md. No commit/push/version increment or personal data changes. Read current INDEX->20261014 memory, role boundaries and actual Git/code. User paused checks, then PM relayed explicit resume; no desktop operations continued during pause.

## Confirmed defects and evidence

1. Normal HTTP bootstrap swallowed every source-settings IndexedDB read failure and returned browser mode. Synthetic test using actual bootstrap settings declaration and controller reproduced loading an older browser workspace instead of stopping. createSourceSettings now propagates unreadable source metadata to reconnect state, no automatic alternate workspace load. Browser-only capability/file fallback remains explicit in factory configuration; failed directory-setting writes still fail and do not claim source switch.
2. Actual flushLegacy failure catch changed toast text but never added show, so failure could be invisible. Real-controller test reproduced hidden failure with pending data. Catch now shows persistent failure, cancels prior success-hide timer, clears queued success messages, leaves official workspace unchanged and controller pending snapshot intact. Real retry test then writes retained data and clears pending. Successful retry UI removes stale error toast.
3. Failed pending saves permitted subsequent data clicks because UI guard checked only active pending flag/saving phase, not controller's retained pending candidate. Failing production listener test reproduced this. Guard now blocks new mutations while keeping data dialog/retry/export/reconnect/explicit-original-browser recovery reachable; beforeinput also blocks data edits. Failed candidate cannot be displaced by subsequent edits.
4. Pending asynchronous saves had no beforeunload protection. Added guard for queued/in-flight/failed pending writes, busy profile/source changes. Browser flow auto-completion checks newly dirtied save after completion too. Browser may ignore unload dialogs (mobile/forced close/power loss); no guaranteed final write promise.

Root-cause boundaries: these are proven code paths, not a proven unique explanation of the user's actual data incident. Historical4173/4195 origins differ and user names do not identify source. No real source merge, reset, directory overwrite or personal-record inspection. Routine entry remains http://127.0.0.1:4173/#work-entry.

## Verification

Latest full suite44/44 passed. New source-reopen tests execute actual bootstrap source-settings declaration, actual flushLegacy with actual controller, pending-click handler, beforeunload handler, browser auto-completion exit handler and explicit browser-only fallback. Old failure tests were observed red before implementation. Controller migration regression proves subsequent record goes only to new repository, original remains unchanged, and a fresh controller reopens the persisted new source without reading browser fallback. Existing real temporary-directory bytes/25h import tests still pass. Repository code still awaits writable.close and readback before acknowledgment; no routing-to-old-repository bug reproduced.

Tests use synthetic data and injected DOM/IDB errors; no actual native File System Access permission lifecycle is asserted. Startup configuration/read faults cannot be attributed to user machine without its original profile evidence. No server restart or user4173 data mutation performed.

Computer Use attempt followed current skill: targeted returned Chrome workbench window, screenshot disabled, planned output filtered to source/status/time only. Window was minimized. Recovery activation/state request was stopped because tool could not confidently determine current browser URL. No source/status/time obtained, no further UI calls, no workaround/private disk access. Reviewer relayed its separate tool profile sees4173 current-browser ready and4195 offline; does not establish user's original profile or permission state. User declined further questions; no new information request made.

## Frozen package and remaining handoff

Current dist/20261014_Beat-Workbench_V1.1.0.zip supersedes earlier same-day candidate; version unchanged, older-date ZIPs retained. Two root entries only: HTML and 使用说明.txt, no private snapshots. README/CHANGELOG reflect current candidate; PM owns memory and any eventual upload. Full version acceptance remains independent.

HTML SHA256: 6AB2BA7548A588AEFB3AAD571CEA031D27CD64D51C217B1F68150020764A2749

ZIP SHA256: D9A40A22128144F4930C01794AC029BC36360220634A4E08F41DD4D0741254F8

Reviewer next: independently rerun44 tests, inspect failed-save visible/pending/retry controls and conservative settings error boundary, compare archive with source. Native UI/per-user source and real record integrity remain unverified. No publication or automatic data recovery claim.
