# STIX State-Driven Portal System Handoff

## Brand Context
This document defines **STIX** as the product and system layer inside a broader ecosystem. For parent-brand and naming guidance, use [`docs/brand/architecture.md`](brand/architecture.md) and [`docs/brand/frisky-developments.md`](brand/frisky-developments.md).

Within that architecture:
- **Frisky Developments** is the parent studio and creative signature.
- **STIX MΛGIC** is the active magic engine described in this handoff.
- **LORE** is the identity layer that gives the magic a user-facing presence.

## Executive Summary
STIX has moved from a collection of UI features into a state-driven portal system. The product should behave like a single persistent shell where user actions update shared state and the interface responds as one coordinated system instead of navigating between disconnected pages.

## Core Architecture
### 1. Three decoupled systems
- **Step machine**: tracks where the user is in the experience.
- **Aura machine**: controls the emotional and visual tone of the interface.
- **Pipeline machine**: represents what the internal engine is doing.

### 2. Persistent shell
- The app should keep a global shell mounted at all times.
- The logo acts as an anchor: it moves and transitions, but never disappears.
- Traditional page changes should be replaced with state transitions.

### 3. Aura system
The aura system is the main visual differentiator and should drive:
- background treatment
- glow intensity
- motion energy
- identity expression

Recommended aura states:
- **idle** → calm
- **processing** → intense / glowing
- **result** → stable / expressive

### 4. Motion system
- Use Framer Motion for transitions.
- Standardize on a single easing curve: `[0.19, 1, 0.22, 1]`.
- Motion should feel subtle, premium, and controlled.
- The logo should feel alive, but never distracting.

## Visual Economy Rules
These rules should remain stable across implementation work.

### Premium constraints
- Black base is dominant.
- Aura is soft, not sharp.
- Glow is diffused, not neon.
- Use one primary color per state, with a maximum of two active colors.
- Motion is slow and controlled.
- `#050505` should always remain visible somewhere in the composition.

### Why the current direction feels expensive
- Soft aura diffusion creates a cinematic look.
- Restrained color use avoids chaos.
- Layered depth between logo, aura, and dark background creates hierarchy.

### Anti-patterns to avoid
- Adding more colors than necessary.
- Adding too many particles.
- Increasing brightness until the glow feels loud.
- Replacing soft diffusion with hard neon edges.

## Production Guardrails
Introduce an `AuraConfig` or equivalent typed configuration that enforces:
- blur values clamped to `40px–100px`
- active colors limited to a maximum of `2`
- opacity kept within the `0.15–0.3` range
- unified glow intensity behavior across states
- saturation protection to prevent overly loud visuals

## Implemented / Intended System Pieces
Use these as the baseline structure for implementation and cleanup.

### Provider and orchestration
- `StixProvider` should own shared state such as `step`, `aura`, and `activeImage`.

### UI shell
- `AppShell` should provide the persistent portal architecture.
- `StixLogoAnimated` should use layout-driven transitions so the logo can move seamlessly between center and header positions.
- `AuraBackground` should render the global atmospheric glow and blur system.

### Flow
- The main experience should be unified into the sequence:
  - intake
  - transform
  - express

## Recommended follow-up for Codex
Use the next pass to make the system production-ready.

### Requested cleanup
- remove inline styles and move them into global CSS
- fully type all state machines (`step`, `aura`, `pipeline`)
- ensure `layoutId` values are not duplicated
- simplify and clean animation variants
- optimize to avoid unnecessary re-renders

### Strategic next step
After cleanup, build pipeline animation for the internal sequence:
- input
- pack
- chat simulation

That sequence is the clearest next opportunity for a high-impact, shareable moment.

## Repository recommendation
If this grows beyond a single web app, keep the logic separated by responsibility.

```text
stix-system/
├── apps/
│   └── web/            # AppShell, UI, animation
├── core/
│   └── aura/           # Aura system + state logic
├── modules/
│   └── pipeline/       # sticker engine steps
```

Guiding rule:
- logic → core
- animation/UI → app
- pipeline → modules

Keeping the system in a core-oriented structure prevents it from collapsing into a purely visual web feature.
