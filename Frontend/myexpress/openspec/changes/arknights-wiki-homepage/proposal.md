# Proposal: Arknights Wiki Homepage

## Summary
Build a new `index.html` for the Arknights wiki homepage that feels like a Rhodes Island terminal: dark, modular, precise, and information-dense. The page should present the site as a mission-critical database rather than a generic fandom portal.

## Why
The current design direction is optimized for immersion and brand alignment. For Arknights, the homepage should immediately signal tactical control, data access, and a clinical terminal aesthetic so users feel like they are entering an in-universe system.

## Goals
- Create a homepage that matches the DESIGN.md terminal-style visual language.
- Make search and category navigation the primary actions.
- Use strong hierarchy to surface featured content, updates, and quick entry points.
- Keep the page readable and responsive across desktop, tablet, and mobile.
- Keep the first version compatible with the existing Django API surface so the homepage can evolve from static entry points into data-backed modules.

## Non-goals
- No backend data fetching or dynamic wiki engine work.
- No redesign of the rest of the wiki beyond the homepage entry point.
- No departure from the documented dark, sharp, low-shadow visual language.

## User Value
- Faster access to key wiki sections.
- Stronger thematic identity and brand consistency.
- A homepage that feels like a trusted database dashboard for players.

## Scope
The first implementation should focus on a single homepage entry file, `index.html`, with the visual structure defined by DESIGN.md and the memo. Likely sections include hero, search, featured categories, updates, and utility/navigation panels.

The homepage should be designed so that its key blocks can later be wired to the Django API without changing the visual model: search and operator discovery should align with `operators/list/` and `stages/`, featured guidance can align with `stages/<stage_id>/guides/`, and operator detail panels can later use `operator/<int:op_id>/skills/`, `operator/<int:op_id>/modules/`, and `operator/<int:op_id>/calculate-total/`.

## Integration Notes
- Static navigation and quick-entry blocks can ship first.
- Data-driven cards should be planned around the existing read APIs, not around new homepage-only shapes.
- Public write APIs such as guide creation or roster updates should stay out of the homepage surface for now.
