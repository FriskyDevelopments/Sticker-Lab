# Integration Contracts (Bot / Web / Platform)

This document defines reusable contracts so new integrations can plug into STIX MΛGIC without rewriting shared logic.

## Contract goals

- Explicit boundaries between shared core and runtime adapters.
- Portable integration model across bot/web/platform surfaces.
- Safe and observable external interactions.

## 1) Surface contracts

### Bot surface contract

Responsibilities:

- Accept commands/events from chat or automation triggers.
- Translate input into shared command/event contracts.
- Invoke shared workflows and adapters.
- Emit structured status events back to platform.

Must not:

- Encode business rules that already exist in shared core/workflow packages.
- Call provider SDKs directly when shared adapter exists.

### Web surface contract

Responsibilities:

- Render user/operator experiences.
- Call platform APIs using contract-defined DTOs.
- Display status/state from shared event models.

Must not:

- Invent incompatible payload formats.
- Bypass review or policy gates in backend workflows.

### Platform surface contract

Responsibilities:

- Expose orchestration APIs and webhook endpoints.
- Enforce review/policy/idempotency requirements.
- Coordinate job execution and status propagation.

Must not:

- Leak provider-specific implementation details to surface clients.
- Accept unvalidated payloads into shared workflow paths.

## 2) Adapter contract

All adapters should expose the same baseline capability model.

```ts
export type AdapterCapability = {
  name: string;
  enabled: boolean;
  supportsDryRun: boolean;
  supportsScheduling: boolean;
  supportsRichMedia: boolean;
};

export type PublishRequest = {
  idempotencyKey: string;
  correlationId: string;
  dryRun: boolean;
  target: string;
  payload: Record<string, unknown>;
};

export type PublishResult =
  | { ok: true; externalId?: string; providerStatus: string }
  | { ok: false; retryable: boolean; code: string; message: string };
```

Implementation rules:

- Input validation happens before provider calls.
- All provider errors map to shared error taxonomy.
- Idempotency key is mandatory for side-effecting calls.
- Adapter returns structured result, never throws opaque strings.

## 3) Event contract

Recommended baseline event envelope:

```ts
export type StixEvent<TPayload = Record<string, unknown>> = {
  eventId: string;
  eventName: string;
  eventVersion: number;
  occurredAt: string; // ISO timestamp
  correlationId: string;
  actorType: 'system' | 'operator' | 'integration';
  payload: TPayload;
};
```

Rules:

- `eventName` must be stable and namespaced.
- `eventVersion` increments for breaking payload changes.
- `correlationId` is propagated across boundaries.

## 4) Error taxonomy contract

Use shared categories to keep retry and alert behavior consistent:

- `validation_error` (not retryable)
- `auth_error` (not retryable until credentials changed)
- `rate_limit` (retryable with backoff)
- `transient_provider_error` (retryable)
- `permanent_provider_error` (not retryable)
- `policy_blocked` (not retryable without operator change)

## 5) Review and policy gate contract

Any publish-capable path must validate:

1. review state is approved,
2. policy/guardrail checks passed,
3. required disclosures present,
4. idempotency key attached,
5. publishing feature flag enabled for environment.

If any check fails, the contract requires a typed rejection response.

## 6) Versioning contract

When changing shared contracts:

- Non-breaking additions: keep version, document fields.
- Breaking changes: increment contract/event version.
- Maintain compatibility layer where practical.
- Update changelog/release notes and this document.

## 7) Integration readiness checklist

Before adding a new bot/web/platform integration:

- [ ] Surface responsibilities align with this contract.
- [ ] Adapter capability metadata is declared.
- [ ] Error mapping follows shared taxonomy.
- [ ] Event envelope and correlation propagation are implemented.
- [ ] Review/policy/idempotency gates are enforced.
- [ ] Env variables are documented in `docs/environment_matrix.md`.
