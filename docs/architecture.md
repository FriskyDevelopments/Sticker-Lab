# STIX MΛGIC Shared Monorepo Architecture

## Purpose

This repository is the **shared foundation** for Frisky Developments products and integrations.
It is intentionally organized so that:

- shared business/domain logic stays shared,
- adapter-specific logic is isolated,
- project apps stay thin and replaceable,
- environment and workflow expectations are explicit.

## Repository boundary decisions

### What belongs in this repository

1. **Shared contracts**
   - Type/schema contracts used by multiple consumers (bot, web, platform).
   - Event names and payload contracts.
   - Adapter capability interfaces and error semantics.

2. **Shared domain logic**
   - STIX/LORE state modeling, policy checks, orchestration rules.
   - Pure reusable utilities with no runtime-specific assumptions.

3. **Adapters and integration surfaces**
   - Platform connectors that implement shared adapter contracts.
   - Delivery/webhook gateway adapters and provider wrappers.

4. **Applications that compose shared packages**
   - Bot runner(s), web shell(s), and internal platform/operator tools.

5. **Operational docs and release safety docs**
   - Environment matrix, release checklist, integration contracts, architecture notes.

### What does **not** belong in this repository

- One-off per-project hacks that cannot be reused.
- Secrets or local machine credentials.
- Integration logic that bypasses shared contracts.
- Duplicated copies of shared logic in app folders.

## Package responsibility model

Use the model below when creating or refactoring packages.

```text
apps/
  bot/                  # Bot surface runtime and wiring only
  web/                  # Web surface runtime and wiring only
  platform/             # Internal/platform surface runtime and wiring only

packages/
  core/                 # Shared domain logic; runtime-agnostic
  contracts/            # Shared types/schemas/events/interfaces
  config/               # Env loading, config validation, defaults
  adapters/             # External provider implementations behind contracts
  workflow/             # Shared orchestration primitives and guards
  observability/        # Logging/metrics/tracing conventions
```

### Core vs adapter vs app rules

- **Core package rule:** no direct SDK/network/file-system side effects unless abstracted via interfaces.
- **Contracts package rule:** stable, versioned, backward-compatible where feasible.
- **Adapter package rule:** translates provider-specific behavior into contract semantics.
- **App package rule:** composes packages; should avoid re-implementing shared rules.

### Dependency direction (must hold)

```text
apps -> core/contracts/config/workflow/adapters
adapters -> contracts/config
core -> contracts
workflow -> contracts/core
contracts -> (no internal deps)
```

If a dependency violates this graph, move logic to the correct package.

## Environment and config conventions

- Environment access should be centralized in `packages/config`.
- Applications read typed config objects, not raw `process.env` directly.
- Required/optional variables must be documented in `docs/environment_matrix.md`.
- Each adapter declares required credentials and capability flags.
- Defaults must be safe (no production side effects when values are missing).

## Workflow safety conventions

- No direct publishing from unreviewed states.
- Idempotency keys required for external delivery actions.
- Retry policy must include terminal failure handling.
- Structured logs include correlation IDs across app/core/adapter boundaries.
- Release process must follow `docs/release_checklist.md`.

## Integration entry points

For any new bot/web/platform integration:

1. implement contracts from `docs/integration_contracts.md`,
2. register adapter capability metadata,
3. map external errors to shared error taxonomy,
4. validate required env variables,
5. pass release checklist preflight.

## Review standard

A change is review-ready when:

- boundary placement is clear,
- env/config impact is documented,
- workflow safety implications are identified,
- integration contracts are unchanged or versioned,
- release notes/checklist items are updated.
