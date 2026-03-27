# Frisky Developments Brand System

This document is the machine-readable operating specification for the Frisky Developments Husky logo identity system.

## 1) Source of truth

- Canonical logo asset: `brand/logo/husky.svg`.
- The Husky shape must remain unchanged from the officially provided source SVG.
- The `F` segment is the system core node and must carry `id="core-node"` in the source SVG.

## 2) Logo variants

- **Primary:** symbol + wordmark (`Frisky Dev`).
- **Icon:** symbol only.
- **Monochrome:** black or white only.
- **Inverted:** white mark on dark background.

## 3) Usage constraints

- Minimum size:
  - Icon: `24px`
  - Full logo: `120px`
- Clear space:
  - `0.25x` of total logo width on all sides.
- Allowed backgrounds:
  - `#1A1A1B` (solid dark)
  - `#FFFFFF` (solid light)
- Forbidden usage:
  - distortion/skewing/stretching
  - recoloring outside Aura palette
  - blur, gradients, bevels, shadow effects on full logo shape

## 4) Geometric and structural rules

- Logo geometry is immutable.
- No rounding/smoothing of edges.
- Preserve original asymmetry.
- Keep `core-node` path relationship and position unchanged.

## 5) Aura color system

Tokens are defined in `brand/tokens/aura.css`:

```css
:root {
  --aura-idle-bg: #1A1A1B;
  --aura-idle-fg: #FFFFFF;

  --aura-cyan: #00F5FF;
  --aura-magenta: #FF00E5;
  --aura-lime: #39FF14;
}
```

## 6) Aura state logic

- `STATE_IDLE`
  - color: white (`--aura-idle-fg`)
  - animation: static
- `STATE_SYNC`
  - color: cyan (`--aura-cyan`)
  - animation: pulse (`2s`)
- `STATE_PEAK`
  - color: magenta (`--aura-magenta`)
  - animation: glitch (`0.4s`)
- `STATE_SUCCESS`
  - color: lime (`--aura-lime`)
  - animation: glow

Context mapping:

- professional → `STATE_IDLE`
- interaction/loading → `STATE_SYNC`
- highlight/feature → `STATE_PEAK`
- success/confirmation → `STATE_SUCCESS`

## 7) Motion system

`brand/motion/animations.ts` exports Framer Motion-ready state configs targeting:

- target selector: `#core-node`

Animation specs:

- Pulse / SYNC:
  - `scale: [1, 1.05, 1]`
  - `duration: 2`
  - `ease: [0.4, 0, 0.2, 1]`
  - `repeat: Infinity`
- Glitch / PEAK:
  - `x: [0, -2, 2, -1, 0]`
  - `duration: 0.4`
  - `repeat: Infinity`
- Glow / SUCCESS:
  - `filter: drop-shadow(0 0 6px currentColor)`

## 8) Validation rules (enforce/reject)

Reject output if any of the following are true:

1. Logo geometry has been modified.
2. A non-Aura color is used for Aura state rendering.
3. Rounded/smoothed vector edits are detected.
4. Motion targets any element other than `#core-node` for Aura state animation.

## 9) Delivery structure

```text
/brand
  /logo
    husky.svg
  /tokens
    aura.css
  /motion
    animations.ts
  BRAND_GUIDELINES.md
```
