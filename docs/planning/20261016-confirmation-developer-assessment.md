# Developer assessment: confirmations and similar actions

2026-10-16. Read-only audit for Designer/PM; not an approved design or implementation. Local HEAD44d8186, matching PM's reported remotely verified baseline;65-test frozen candidate. INDEX memory contains historical pending-sync text; latest PM report supersedes that historical status, not independently remote-verified here. Product code, packages, versions, PRD and memory untouched. Only this assessment added; unrelated analysis draft left alone.

## Actual confirmation inventory

Source scan:11 native confirm calls (bootstrap8, app3), plus custom profile-draft choice, folder decision/backup selection and mandatory abnormal-flow form. Native browser folder permission/file dialogs are platform controls and cannot be treated as app confirmations to auto-accept.

| Existing path and code | Technical classification / simplification candidate | Boundary to retain |
| --- | --- | --- |
| bootstrap.js:44 showError writes storage-detail then alert | Non-mutating acknowledgment; can become one visible persistent inline/status error without extra OK | Error must remain visible on current screen, especially failed/uncertain save; not auto-hide or report success |
| bootstrap.js:116 same-directory alert | No-op informational acknowledgment; can show inline already-connected state | isSameEntry check remains; no new writes |
| bootstrap.js:82 guardDraft 3-way choice before closing/switching | Only needed for actual changes; can combine with final source decision instead of stacked dialogs | Save failure stops next action; never silently choose discard or transfer draft to another user |
| app.js:1662 formGuard nonempty text test | Current dirty heuristic can warn merely after opening an existing record with no edit; compare to saved/baseline values in eventual design | Genuine unsaved edits still need save/keep/discard choice; do not convert all prompts to automatic discard |
| bootstrap.js:100 guardSource -> draft/form checks -> flush -> source action | Multiple independent checks can be summarized once at the final consequential action | Preserve timers blocked, pending-save protection, acknowledged flush; not every branch occurs on every click |
| bootstrap.js:57 and134 original browser fallback | Pending-discard warning + source summary + empty-browser creation can stack; combine into one explicit result-specific choice | Reading an older browser source and dropping pending changes require clear consequence; empty-workspace creation is not reconnection |
| bootstrap.js:58 temporary session | Could use explicit action label and persistent temporary banner rather than separate generic confirm | Must clearly state closing loses data and this cannot promise durable flow recovery; action remains deliberate |
| bootstrap.js:118–130 folder choice | If entry explicitly means migrate-current and target verified empty, could remove an extra generic yes/no; existing mixed entry still needs use-target vs migrate distinction | Occupied target never automatically merged/overwritten; preserve source/target summary, old files, close/readback/settings-before-switch |
| bootstrap.js:133 return folder data to browser | Keep one clear final decision, fold related dirty handling into it | Writes current browser snapshot after preserving prior browser copy; switching source affects future saves |
| bootstrap.js:53 directory previous repair | One consequence-aware recovery decision remains | Primary is replaced; first damaged original protected, prior snapshot may omit newer records |
| bootstrap.js:145 backup chooser then146 confirm restore | Can consolidate into chooser with explicit restore-and-use CTA and current/selected summary | This replaces browser current data, not just preview; cannot auto-accept selection |
| bootstrap.js:141 reload-folder confirm | Can skip unnecessary discard warning when no pending/dirty edits, but current pending initialization is forbidden | Do not discard candidate silently; current visible reload button can be blocked by pending guard and initialize, so eventual UI should disable/explain rather than appear unresponsive |
| app.js:1438 delete log | Keep while no undo exists | Current implementation removes from logs and saves; no per-record undo guarantee |
| app.js:1775 discard meeting/task checkpoint | Keep destructive no-record consequence explicit | Saved session is removed; lost time/draft is not a routine reversible toggle |
| app.js:1713 abnormal flow confirmation | This is required factual input and terminal persistence, not redundant yes/no | Actual end cannot be inferred; no default now, skip or auto-accept; stable ID/owner, dates and acknowledged idempotent write retained |

## Existing direct actions (already no extra confirmation)

Opening/closing clean views/dialogs, clean profile switch, report edit/finish toggle (app750), task complete toggle, profile Save, avatar draft choose/remove, JSON/report export, save retry and directory authorization request generally already execute directly. Start flow and normal finish also use their explicit button as consent, then wait for persistence. Native OS/browser permission remains separate. Default-agree changes should not add new confirm to these paths or bypass backend validity/write acknowledgment.

Profile changed() at bootstrap79 compares raw input to official trimmed name, so whitespace-only edits may prompt despite no effective name change. Eventual implementation can compare normalized effective values, preserving name validation; not blindly auto-save unknown draft.

## Similar buttons: candidates for visual consolidation, not data conflation

| Group | Existing distinction | Feasible handoff to Designer |
| --- | --- | --- |
| Save retry / reconnect / reload / previous repair / old browser / temporary | Retry candidate, request permission, reread source, replace from snapshot, switch older source and create nondurable workspace are different | Show one state-specific primary action, put secondary recovery choices in one menu; always keep export and actionable reason visible during hangs/errors |
| User backup / whole workspace recovery export | User-only records/tasks/avatar vs all users/sessions/pending candidate | One export menu with explicit scope labels; retain both handlers, never choose wrong scope silently |
| Word/PPT/PDF/copy report | Same report, different destinations/formats | One labeled export menu can reduce visible buttons; copying can remain direct; no need additional confirm |
| Choose/remove avatar + profile Save | First two edit draft, Save commits existing user's stable ID | Avatar action menu possible; do not accidentally autosave, create new user or mix with independent-user/import flow |
| Open flow / Start / normal finish / Save status | Navigate, create durable start, settle current session, access recovery | State-specific presentation possible; entry navigation must not fake-start; save-status/export remains reachable in focused view |
| Complete task vs stop tracking | Checkbox changes task state; stop tracking creates time record (app290) | Do not merge merely because both sound like done; label their effects |
| Edit report / finish editing | Already same button text/state (app750) | Preserve existing toggle; no extra save-confirm layer |

## Concrete data risks relevant to simplification

- browserRecovery currently calls browserRepo.save(value,null,{replace:true}) without preserve:true before switching. The recovery list remains, but current browser's latest ordinary edits need not be archived in it. Thus cannot classify restore as a reversible routine operation or simply remove its consequence message. Any archive-before-replace improvement is separate approved work, not implemented here.
- Deleting a timed record is not trivially undoable through the legacy adapter: settledSessionIds retains session; settleLegacySnapshot rejects re-adding its missing session record. In-memory synthetic probe: deletedCount0, naiveUndoCount0. A future undo must use a designed restoration transaction, not just push the old log then save. No personal data touched.
- Current reload action may be visible in directory error/conflict while global pending guard refuses its click and controller.initialize also rejects pending. Consolidation should reflect actual availability, not relabel this as a safe retry.
- Receipt timeout, conflict and source settings failure are different from an ordinary confirm. UI changes must leave writer fencing/bounded queue/late verification and recovery export intact.

## Suggested order for PM/Designer confirmation

First reduce non-mutating OK acknowledgments, false dirty prompts, and duplicate visual export/recovery controls. Then consolidate chained source/dirty warnings into one explicit final decision. Keep deletion/discard/older-source replacement explanations unless a real tested undo/archive path is approved. Keep manual actual-end input mandatory. These are proposals only; await user's concrete design confirmation before product changes.

No test suite/build rerun for this documentation-only assessment;65 baseline evidence remains historical verified evidence, not a new test claim. Existing package hashes checked unchanged. No upload, dependency or desktop/browser operations.
