# Release Checklist

Use this checklist for every release that affects shared contracts, adapters, workflows, or app surfaces.

## 1) Scope and boundary integrity

- [ ] Changes stay within monorepo boundaries (no split-repo assumptions).
- [ ] Shared logic remains in shared packages (no app-level duplication).
- [ ] Package responsibilities are still clear after the change.
- [ ] Dependency direction still follows documented architecture.

## 2) Contract and compatibility safety

- [ ] Contract changes are documented in `docs/integration_contracts.md`.
- [ ] Breaking changes are versioned and called out in release notes.
- [ ] Event payload shape changes are backward-compatible or intentionally migrated.
- [ ] Adapter capability changes are documented.

## 3) Environment and configuration safety

- [ ] New/changed env vars are added to `docs/environment_matrix.md`.
- [ ] `.env.example` placeholders are updated when applicable.
- [ ] Production defaults are safe (review gates, dry-run, explicit enable flags).
- [ ] Secrets are not committed and are sourced from secure secret stores.

## 4) Workflow and operational safety

- [ ] Review gate remains enforced for publish paths.
- [ ] Idempotency protections are active for external calls.
- [ ] Retry behavior avoids unbounded loops and includes dead-letter strategy.
- [ ] Correlation IDs are preserved in cross-surface flows.

## 5) Validation checks

Run what is available in the repository and record outcomes:

- [ ] Lint/format checks
- [ ] Unit/integration tests
- [ ] Contract/schema validation
- [ ] Build/type checks
- [ ] Link/doc sanity checks

If a check cannot run in this repository state, document blocker + manual follow-up.

## 6) Review packet quality

- [ ] PR summary explains boundary decisions.
- [ ] PR summary explains env/workflow impact.
- [ ] PR summary explains integration impact.
- [ ] Blockers and manual next steps are listed.

## 7) Release decision gate

- [ ] **Go** only when high-risk checklist items pass or have approved mitigations.
- [ ] **No-go** when contract ambiguity, env ambiguity, or review-gate bypass risk remains.

## Suggested release note sections

1. Repository boundary decisions
2. Contract changes (if any)
3. Env/config updates
4. Workflow safety changes
5. Known blockers and required manual actions
