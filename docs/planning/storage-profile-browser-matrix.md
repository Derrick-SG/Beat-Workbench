# V1.1.0 candidate browser matrix

Date: 2026-10-09. Developer evidence only, independent acceptance pending.

| Environment / scenario | Actual coverage | Result / limit |
|---|---|---|
| Codex In-app Browser, HTTP 127.0.0.1:4175 | Opened integrated app, user dialog, renamed synthetic user, saved, reloaded, added second synthetic user | Observed acknowledged name and reload persistence; independent users visible |
| Same browser, synthetic PNG | Actual filechooser with locally generated 1px PNG, draft processing | Preview draft accepted; save enabled. A later save click hit automatic approval timeout, so avatar persistence/reload is not claimed |
| Same browser, directory picker | Clicked actual choose-folder control; DOM unchanged, console error list empty, no controllable native picker returned | No directory granted, read, write or authorized-restart validation. API presence is not pass evidence |
| Actual Chrome and Edge desktop native directory access | Not performed through current tool | Required manual/Reviewer test before acceptance |
| Standalone file entry | Built/parsed single-file output; file protocol UI not exercised | Candidate deliberately disables native directory mode for file URLs; browser/manual backup path needs actual file smoke |
| Safari / iOS / Android / Firefox | Not available in this Developer run | Browser/manual capability fallback is implemented, not a cross-platform pass claim |
| Office / print final layout | Not performed in this phase | Original export code preserved; independent regression/visual inspection pending |

## Manual directory and timer validation required

1. Start source server; open a fresh desktop Chrome/Edge profile at a stable localhost/127.0.0.1 port. Use only synthetic data and a disposable explicitly selected empty folder, never a real work directory.
2. Create two users and records, choose empty folder, confirm summary. Check main file format/schema/profile IDs/records/tasks/avatars on disk. Reload/reopen with granted permission: same dataset must load. Revoke permission: no defaults or empty files written; reconnect needs user action, original browser fallback states source/time honestly.
3. Select existing valid folder; alter its file after preview before confirmation: activation must reject and request a fresh summary. Test denied/cancelled picker, missing/blank/corrupt/newer-schema primary: existing source remains, no automatic overwrite.
4. Make valid changes twice to create previous snapshot; then corrupt primary. Use explicit restore, check damaged.json preserves original bytes and restored primary validates. Simulate blocked primary write, retry after resolving OS permissions; no successful receipt before close and verification.
5. Switch from directory to browser after summary confirmation; list independent browser recovery copies. Save normally, reconnect a different directory and switch back: first recovery entry must remain. Recover a selected entry without modifying the directory.
6. For flow/meeting/task separately, work at least15 seconds and wait for successful checkpoint; close for a known interval, reopen paused, resume15 seconds and finish. New record timeSegments and day/week/month/year totals must exclude closed interval. Discard should add no record. Retried uncertain completion must not duplicate session ID.
7. Test same-origin second tab writes and an external editor; detected conflicts stop saving and allow current-candidate export. This does not establish multi-device/process atomicity.
8. Test JPEG/PNG/WebP, transparency and portrait/landscape; inspect 256x256, output <=200KB, 28/36/72 circles and keyboard flow. Reject malformed/SVG/oversized input without changing official profile. Roundtrip v4 plus import v3 and legacy array; old app cannot preserve avatars or segment semantics.

Evidence files and synthetic uploads are ignored, not included in Git or share ZIP. Native picker capability and the avatar-save approval timeout remain explicit limits, not simulated passes.
