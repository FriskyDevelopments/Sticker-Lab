# Connector Contracts

Connectors are adapters between internal publish intents and external destinations.

## Contract requirements

Each connector implementation should provide:

- `validateConfig()`
- `preflight(intent)`
- `publish(intent)`
- `getStatus(remoteId)`
- `normalizeError(error)`

## Safety constraints

- Must reject startup when required credentials are missing.
- Must support idempotency through external request keys where available.
- Must return structured error categories (`auth`, `rate_limit`, `validation`, `transient`, `fatal`).
- Must not log raw secrets or full credential payloads.

## Observability requirements

Emit events for:

- publish requested
- publish accepted/rejected
- retry scheduled
- publish completed/failed

Every event should include:

- connector name
- campaign ID
- publish intent ID
- correlation ID
- timestamp (UTC)

## Recommended directory placement

```text
packages/connector-sdk/
  src/
    types.ts
    base-connector.ts
    connectors/
      instagram.ts
      x.ts
      discord.ts
      email.ts
```

## Testing baseline

- Unit tests for config validation and payload mapping.
- Contract tests for error normalization.
- Sandbox smoke tests for each supported destination.
