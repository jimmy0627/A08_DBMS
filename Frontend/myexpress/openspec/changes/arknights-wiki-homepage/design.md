# Design: Arknights Wiki Homepage

## Overview
This homepage should translate the DESIGN.md into a single-page HTML layout that looks like a Rhodes Island terminal. The design should feel structured, controlled, and data-oriented, with teal used sparingly to guide attention.

## Visual Principles
- Use a near-black background with dark gray panels.
- Keep corners sharp: zero or near-zero border radius.
- Avoid heavy shadows and glossy effects.
- Use thin borders, modular blocks, and dense alignment.
- Reserve teal for active states, emphasis, and primary actions.
- Use red only for warnings or urgent notices.

## Typography
- Primary Chinese text should use a clear sans-serif stack.
- English labels and data accents should look system-like and technical.
- Secondary labels should be small, spaced out, and often prefixed with `//`.

## Page Structure
1. Header with site identity and primary navigation.
2. Hero area with a strong title and short intro.
3. Search panel as the highest-priority action.
4. Quick-entry category grid for main wiki sections.
5. Featured or recent content blocks.
6. News / notices / updates panel.
7. Compact footer with metadata and utility links.

## Responsive Behavior
- Desktop: multi-column dashboard layout.
- Tablet: reduce columns and stack secondary panels.
- Mobile: single-column layout, smaller hero, collapsed navigation, preserved hierarchy.

## Content Interpretation Rules
When DESIGN.md does not define a component explicitly, use the memo rule: mark the intent as `DESIGN.md 未定義`, then infer the component as a restrained, square, terminal-like module that supports fast navigation and clear hierarchy.

## API Mapping Strategy
- Keep the first homepage version split between static navigation modules and API-backed information blocks.
- Use `operators/list/` and `stages/` for summary counters, search suggestions, and fast discovery.
- Use `stages/<stage_id>/guides/` for featured or recommended content tied to stages.
- Reserve `operator/<str:op_name>/materials/<int:elite_stage>/`, `operator/<int:op_id>/skills/`, `operator/<int:op_id>/modules/`, and `operator/<int:op_id>/calculate-total/` for operator detail views or drill-down panels.
- Avoid placing write-heavy actions such as create, delete, or roster update directly into the homepage unless the UI is clearly an admin surface.

## Implementation Notes
- Prefer semantic HTML sections and navigation landmarks.
- Keep the page self-contained enough to be styled directly from the homepage file if needed.
- Avoid decorative elements that weaken the terminal/database feeling.
- Treat the homepage as a thin presentation layer that can later fetch content through a same-origin proxy or API bridge.
