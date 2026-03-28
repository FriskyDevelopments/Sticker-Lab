# Automation Workflows

This is the baseline workflow set for the future LORE × STIX automation system.

## 1. Campaign authoring

1. Operator creates campaign brief.
2. System assigns campaign ID and initial state (`draft`).
3. Templates are resolved with structured variables.
4. Asset package is attached and validated.

Exit criteria:
- campaign metadata complete
- required disclosure fields present
- at least one channel target selected

## 2. Asset pipeline

1. Register source files.
2. Generate renditions per destination/channel.
3. Extract metadata (dimensions, duration, hash).
4. Run quality checks (size, format, policy blocks).
5. Mark package `ready` or `failed`.

Exit criteria:
- all required renditions complete
- no blocker policy violations

## 3. Review and approval

1. Create review task bundle.
2. Collect reviewer decisions.
3. Store annotations and rationale.
4. Require threshold approvals before scheduling.

Exit criteria:
- approval threshold met
- no unresolved blocking comments

## 4. Scheduling and dispatch

1. Validate blackout windows and channel constraints.
2. Generate publish intents with idempotency keys.
3. Enqueue publish jobs.
4. Emit dispatch telemetry events.

Exit criteria:
- intents persisted
- queue handoff acknowledged

## 5. Publish and reconciliation

1. Connector posts content to destination.
2. Store remote identifiers and status.
3. Retry on transient failures with backoff.
4. Dead-letter terminal failures for operator intervention.

Exit criteria:
- final status captured (`published`, `failed`, `canceled`)
- post-publication analytics event emitted
