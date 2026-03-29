# Environment Matrix

This matrix defines shared environment expectations for bot/web/platform surfaces in the STIX MΛGIC monorepo.

## Usage rules

- Never commit real secrets.
- Keep `.env.example` values non-sensitive placeholders.
- Validate env at startup through shared config loaders.
- Fail fast for required production variables.
- Use least-privilege credentials per adapter.

## Global variables (all surfaces)

| Variable | Required | Surfaces | Example | Notes |
|---|---|---|---|---|
| `NODE_ENV` | Yes | all | `development` | One of `development`, `test`, `production`. |
| `APP_ENV` | Yes | all | `local` | Deployment target label (`local`, `staging`, `production`). |
| `LOG_LEVEL` | No | all | `info` | Default `info`; increase in local debug only. |
| `STIX_CORRELATION_HEADER` | No | all | `x-stix-correlation-id` | Header name for request tracing. |

## Database and queue

| Variable | Required | Surfaces | Example | Notes |
|---|---|---|---|---|
| `DATABASE_URL` | Yes (platform/web) | web, platform | `postgres://...` | Source-of-truth persistence. |
| `REDIS_URL` | Yes (scheduler/publisher) | bot, platform | `redis://...` | Queue, cache, and short-lived coordination. |
| `QUEUE_PREFIX` | No | bot, platform | `stix` | Separate namespaces per environment. |

## Auth/session

| Variable | Required | Surfaces | Example | Notes |
|---|---|---|---|---|
| `AUTH_ISSUER_URL` | Yes (web/platform) | web, platform | `https://issuer.example.com` | OIDC issuer. |
| `AUTH_AUDIENCE` | Yes (web/platform) | web, platform | `stix-api` | Token audience validation. |
| `SESSION_SECRET` | Yes | web, platform | `<secret>` | Rotate regularly; never share across envs. |

## Storage and assets

| Variable | Required | Surfaces | Example | Notes |
|---|---|---|---|---|
| `ASSET_BUCKET` | Yes | bot, web, platform | `stix-assets-prod` | Object storage bucket/container. |
| `ASSET_REGION` | Yes | bot, web, platform | `us-east-1` | Region for storage provider. |
| `ASSET_CDN_BASE_URL` | No | web | `https://cdn.example.com` | Public asset URLs for presentation. |

## Adapter/provider credentials

| Variable | Required | Surfaces | Example | Notes |
|---|---|---|---|---|
| `DISCORD_BOT_TOKEN` | Conditional | bot | `<secret>` | Required only when Discord adapter enabled. |
| `X_API_KEY` | Conditional | bot, platform | `<secret>` | Required only when X adapter enabled. |
| `WEBHOOK_SIGNING_SECRET` | Yes (ingress) | platform | `<secret>` | Verify inbound webhook authenticity. |
| `PUBLISH_DRY_RUN` | No | bot, platform | `true` | Defaults to `true` outside production. |

## Feature flags and safety

| Variable | Required | Surfaces | Example | Notes |
|---|---|---|---|---|
| `ENABLE_PUBLISHING` | Yes (prod) | bot, platform | `false` | Must be explicit for production publish. |
| `ENABLE_ADAPTER_<NAME>` | No | all | `ENABLE_ADAPTER_DISCORD=true` | Adapter capability toggle per environment. |
| `ENFORCE_REVIEW_GATE` | Yes | all | `true` | Prevents bypass of review states. |
| `IDEMPOTENCY_TTL_SECONDS` | No | bot, platform | `86400` | Replay protection window. |

## Recommended env file layout

```text
.env.example               # shared non-secret defaults
.env.local                 # developer local overrides (gitignored)
.env.test                  # CI/test settings
.env.staging               # staging deployment managed by platform
.env.production            # production deployment managed by platform
```

## Validation checklist

Before enabling a new surface or adapter:

1. List all new variables in the matrix.
2. Populate `.env.example` with placeholder values.
3. Implement runtime validation in the shared config package.
4. Confirm production-safe defaults (dry-run/review gates).
5. Verify rotation and secret ownership with platform team.