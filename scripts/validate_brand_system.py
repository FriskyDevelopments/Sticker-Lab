#!/usr/bin/env python3
"""Validate Frisky/STIX brand-system invariants.

This script is intentionally dependency-free so it can run in local shells and CI.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "brand/logo/husky.svg"
TOKENS_PATH = ROOT / "brand/tokens/aura.css"
ANIMATIONS_PATH = ROOT / "brand/motion/animations.ts"
GUIDELINES_PATH = ROOT / "brand/BRAND_GUIDELINES.md"

REQUIRED_TOKEN_VALUES = {
    "--aura-idle-bg": "#1a1a1b",
    "--aura-idle-fg": "#ffffff",
    "--aura-cyan": "#00f5ff",
    "--aura-magenta": "#ff00e5",
    "--aura-lime": "#39ff14",
}

REQUIRED_DATA_STATES = {"idle", "sync", "peak", "success"}
REQUIRED_AURA_STATES = ["idle", "sync", "peak", "success"]


def read_text(path: Path) -> str:
    if not path.exists():
        fail(f"Missing required file: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


def fail(message: str) -> None:
    print(f"❌ {message}")
    raise SystemExit(1)


def pass_msg(message: str) -> None:
    print(f"✅ {message}")


def parse_css_variables(css: str) -> dict[str, str]:
    pattern = re.compile(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", re.IGNORECASE)
    return {name.lower(): value.strip().lower() for name, value in pattern.findall(css)}


def validate_logo(svg: str) -> None:
    if 'id="core-node"' not in svg:
        fail('`brand/logo/husky.svg` must include a path with id="core-node".')
    pass_msg('Logo includes required `#core-node` id.')


def validate_tokens(css: str) -> None:
    variables = parse_css_variables(css)

    for token, expected in REQUIRED_TOKEN_VALUES.items():
        actual = variables.get(token)
        if actual != expected:
            fail(f"Token {token} expected {expected}, found {actual!r}.")

    state_selector_matches = re.findall(r"\[data-aura-state=['\"]([a-z-]+)['\"]\]", css)
    states = set(state_selector_matches)
    if states != REQUIRED_DATA_STATES:
        fail(
            "`brand/tokens/aura.css` data-aura-state selectors must be exactly "
            f"{sorted(REQUIRED_DATA_STATES)}; found {sorted(states)}."
        )

    pass_msg("Aura tokens and state selectors are consistent.")


def validate_animations(ts: str) -> None:
    if "export type AuraState = 'idle' | 'sync' | 'peak' | 'success';" not in ts:
        fail("`AuraState` union must stay aligned to idle/sync/peak/success.")

    if "export const CORE_NODE_SELECTOR = '#core-node';" not in ts:
        fail("`CORE_NODE_SELECTOR` must target `#core-node`.")

    if "professional" not in ts or "interaction-loading" not in ts:
        fail("`auraStateByContext` mapping appears incomplete.")

    for state in REQUIRED_AURA_STATES:
        if re.search(rf"\b{state}:\s*{{", ts) is None:
            fail(f"Missing animation definition for state `{state}`.")

    if "repeat: Infinity" not in ts:
        fail("Expected repeating animation behavior for sync/peak states.")

    pass_msg("Animation config exports required structure and guardrails.")


def validate_guidelines(md: str) -> None:
    required_phrases = [
        "Canonical logo asset: `brand/logo/husky.svg`.",
        "`id=\"core-node\"`",
        "Tokens are defined in `brand/tokens/aura.css`",
        "`brand/motion/animations.ts` exports",
    ]
    for phrase in required_phrases:
        if phrase not in md:
            fail(f"Missing expected guideline phrase: {phrase}")

    pass_msg("Brand guidelines still reference canonical assets and motion contract.")


def main() -> None:
    logo = read_text(LOGO_PATH)
    tokens = read_text(TOKENS_PATH)
    animations = read_text(ANIMATIONS_PATH)
    guidelines = read_text(GUIDELINES_PATH)

    validate_logo(logo)
    validate_tokens(tokens)
    validate_animations(animations)
    validate_guidelines(guidelines)

    print("\n🎉 Brand system validation passed.")


if __name__ == "__main__":
    main()
