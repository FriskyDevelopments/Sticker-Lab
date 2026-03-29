# Automation Guardrails

This document defines minimum safety controls for any future LORE × STIX automation implementation.

## Safety baseline

- **Manual publish approval is mandatory.** Public posting cannot happen from a fully autonomous job.
- **Secrets are environment-scoped.** Development, staging, and production credentials must be separated.
- **No implicit provider fallback.** Missing required keys should fail startup with explicit errors.
- **Every publish intent is idempotent.** Retrying jobs must not produce duplicate external posts.
- **Connector actions are auditable.** Every outbound action should produce a durable event.

## Environment separation

Use distinct environment names with explicit promotion:

1. `dev`: local and sandbox connectors only.
2. `staging`: pre-production systems with non-customer channels.
3. `prod`: live channels and customer-facing destinations.

Rules:

- Production deploys must only be triggered from protected branches.
- Promotion should be one-way (`dev` → `staging` → `prod`) with check gates at each stage.
- Production credentials must not exist in local `.env` files.

## Secret handling expectations

- Keep `.env` files out of git.
- Store secret values in your deployment platform secret manager.
- Rotate API keys on a fixed cadence (recommended: every 90 days).
- Record key ownership and rotation date in an operations log.

## Startup validation requirements

At process startup, validate:

- required environment variables for enabled connectors
- queue and database connectivity
- object storage bucket/container accessibility
- brand policy pack load success

If validation fails, the process should exit with a clear reason.

## Publish safeguards

Before enqueueing a publish job, enforce:

- campaign state is approved
- review threshold is met
- required disclosure labels are present
- media package is marked ready
- channel-specific policy checks have passed

## Operational observability

Minimum telemetry for production readiness:

- enqueue rate, success rate, retry rate, dead-letter count
- publish latency distribution by connector
- approval queue age and SLA breach alerts
- policy violation counts by rule type

## Incident and rollback

When a connector or campaign flow is unstable:

1. Pause new publish intents.
2. Drain in-flight jobs to completion or dead-letter.
3. Disable affected connector credentials.
4. Run post-incident review with timeline and root cause.
5. Document required guardrail changes before re-enabling.
