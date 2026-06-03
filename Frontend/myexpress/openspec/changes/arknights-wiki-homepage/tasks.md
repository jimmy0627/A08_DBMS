# Tasks: Arknights Wiki Homepage

- [x] Draft the semantic HTML skeleton for `index.html`.
- [x] Add the homepage hero, search, and primary navigation sections.
- [x] Add category / quick-entry panels for core wiki destinations.
- [x] Add featured content and updates panels.
- [x] Ensure the markup reflects the Rhodes Island terminal style from DESIGN.md.
- [x] Verify the layout degrades cleanly to tablet and mobile widths.
- [x] Review the final structure against the memo and tighten any missing homepage modules.
- [x] Map each homepage block to the appropriate Django read API before wiring live data.
- [x] Add an API bridge or proxy plan so `myexpress` can reach `Wiki_Database` without cross-origin issues.
- [x] Define which homepage panels remain static in v1 and which panels should become API-backed first.
- [x] Reserve operator detail drill-downs for `operators/list/`, `stages/`, `stages/<stage_id>/guides/`, `operator/<int:op_id>/skills/`, and `operator/<int:op_id>/modules/`.
- [x] Keep write actions such as guide creation, roster updates, and admin mutations outside the public homepage scope.
