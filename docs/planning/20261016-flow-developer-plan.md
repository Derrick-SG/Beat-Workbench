# 2026-10-16 Developer implementation plan

Approved scope/Designer flow-abnormal-settlement-ui-spec.md and Reviewer plan govern implementation. Shared checkout, no agents/commit/push/version bump. Synthetic tests only, no4173 data. Latest15 memory and actual clean product baseline checked; only unrelated analysis draft was untracked.

1. Reproduce slow-write recovery lock; keep data/export/navigation reachable. Bounded save deadline/public request with same-repo writer retained, bounded queued requests, no concurrent retry or late automatic activation. Tests before fix.
2. Add durable-flow model/service: stable start intent/project/owner/epoch, acknowledged start only, browser+directory repositories; full-span abnormal manual end vs normal actual segments, positive duration, settled-ID idempotence/uncertain receipt retry, legacy session interpretation.
3. Integrate explicit start, immutable running project, forced flow-only recovery modal, empty seconds-level manual end, validation/preview, no skip/Esc/background navigation, retained failure state and recovery export/access. Keep meeting/task behavior.
4. Production-chain/unit/integration/isolated UI verification as tools permit. Build and dated candidateZIP, updateREADME/CHANGELOG/handoff with exact coverage and limits. Reviewer independent acceptance, PM memory/upload.
