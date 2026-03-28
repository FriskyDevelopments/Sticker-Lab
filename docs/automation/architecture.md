# LORE × STIX premium automation architecture

## Purpose

This document defines a premium automation system for Frisky Developments that coordinates branded digital publishing, asset operations, operator review, and scheduled releases without drifting into spam, deceptive automation, or low-quality content generation.

The system is designed as a **presence engine**, not a growth-hacking machine. Its job is to preserve brand quality while reducing repetitive operator work.

## Companion docs

- Workflow lifecycle definitions: [`docs/automation/workflows.md`](./workflows.md)
- Connector contracts and observability baseline: [`docs/automation/connectors.md`](./connectors.md)
- Operational guardrails: [`docs/automation/guardrails.md`](./guardrails.md)

## Design constraints

- **Operator-first:** humans control campaign intent, release timing, and final approval.
- **High design standards:** publishing is blocked when assets, copy, or metadata fail quality checks.
- **Manual approval before publish:** no fully autonomous public posting.
- **Reusable workflow modules:** each subsystem can be composed into new campaign flows.
- **Premium brand consistency:** templates, states, and connectors inherit shared brand rules.
- **No mass scraping spam:** external ingestion is explicit, narrow, and source-audited.
- **No low-quality affiliate posting:** monetized links or promotions require explicit operator tagging and approval.
- **No deceptive automation:** generated copy and transformed media must remain attributable and reviewable.

## 1. Architecture

### Recommended topology

Use a monorepo with three layers:

1. **Applications** for operator-facing surfaces and automation workers.
2. **Domain packages** for campaign logic, state machines, templates, and brand rules.
3. **Infrastructure packages** for persistence, queues, connector SDKs, and event transport.

This keeps brand and workflow logic independent from any single runtime, provider, or publishing platform.

### Reference architecture

```text
Operator Dashboard
  ├─ Campaign editor
  ├─ Review inbox
  ├─ Asset status console
  └─ Release calendar
        │
        ▼
Application API / BFF
  ├─ Auth + RBAC
  ├─ Campaign orchestration
  ├─ Review actions
  └─ Query layer for dashboard
        │
        ├───────────────┬────────────────┬─────────────────┐
        ▼               ▼                ▼                 ▼
 lore_state_engine  stix_asset_pipeline  publish_queue  campaign_scheduler
        │               │                │                 │
        └──────┬────────┴───────┬────────┴─────────┬───────┘
               ▼                ▼                  ▼
        template_registry  brand_guardrails  analytics_events
               │                │                  │
               ▼                ▼                  ▼
        Connector abstraction  Policy engine   Event bus / warehouse
               │
               ▼
    Instagram / X / Discord / Email / Web CMS / Event feeds
```

### Core runtime decisions

- **API and dashboard:** TypeScript with Next.js or a comparable full-stack web framework.
- **Workers:** TypeScript background workers for orchestration-heavy jobs; Python may be introduced later for media tooling if needed.
- **State and queue persistence:** PostgreSQL for source-of-truth records, Redis or a managed queue for short-lived scheduling and job dispatch.
- **Blob storage:** S3-compatible object storage for assets, renditions, thumbnails, and review proofs.
- **Analytics:** append-only event stream into warehouse tables for operational and campaign reporting.

## 2. Recommended monorepo placement

Place the automation system beside the existing brand documentation, not mixed into brand copy docs.

```text
/
├─ apps/
│  ├─ operator-dashboard/
│  ├─ automation-api/
│  ├─ scheduler-worker/
│  └─ publisher-worker/
├─ packages/
│  ├─ lore_state_engine/
│  ├─ stix_asset_pipeline/
│  ├─ campaign_scheduler/
│  ├─ publish_queue/
│  ├─ operator_review/
│  ├─ template_registry/
│  ├─ brand_guardrails/
│  ├─ analytics_events/
│  ├─ connector-sdk/
│  ├─ design-tokens/
│  └─ shared-types/
├─ infrastructure/
│  ├─ db/
│  ├─ queue/
│  ├─ storage/
│  ├─ observability/
│  └─ deployment/
├─ docs/
│  ├─ brand/
│  ├─ automation/
│  │  ├─ architecture.md
│  │  ├─ workflows.md
│  │  ├─ guardrails.md
│  │  └─ connectors.md
│  └─ stix-system-handoff.md
└─ README.md
```

For the current repository state, the first implementation artifact should live at `docs/automation/architecture.md`, with supporting docs added as the system takes shape.

## 3. Package boundaries

### `packages/lore_state_engine`

Responsible for campaign identity, aura states, release states, and transition rules.

Owns:
- canonical campaign state model
- aura/state vocabulary
- transition validation
- state history recording
- campaign-level policy hooks

Does not own:
- media processing
- publishing connector details
- UI rendering

### `packages/stix_asset_pipeline`

Responsible for asset intake, transformation jobs, metadata enrichment, packaging, and readiness status.

Owns:
- source asset registration
- renditions and derivative generation
- metadata extraction
- asset QA status
- packaging rules for channel-specific outputs

Does not own:
- campaign scheduling
- final approval decisions

### `packages/campaign_scheduler`

Responsible for turning approved campaign plans into time-based execution intents.

Owns:
- schedule windows
- calendar constraints
- recurrence and blackout rules
- preflight timing checks
- dispatch of publish intents into queue

Does not own:
- platform posting logic
- content generation

### `packages/publish_queue`

Responsible for publish intent lifecycle and connector handoff.

Owns:
- publish jobs
- retry policy
- idempotency keys
- dead-letter handling
- post-publication result capture

Does not own:
- brand rules
- campaign authoring

### `packages/operator_review`

Responsible for manual approval workflow.

Owns:
- review tasks
- approval/rejection decisions
- annotated feedback
- reviewer assignments
- required approval thresholds

Does not own:
- schedule dispatch after approval except via published events

### `packages/template_registry`

Responsible for structured templates used for copy, metadata blocks, captions, landing-page fragments, event cards, and release notes.

Owns:
- template definitions
- versioning
- variable schema
- preview assembly
- locale or channel variants

Does not own:
- campaign state
- rendering outside template composition contracts

### `packages/brand_guardrails`

Responsible for automated quality and policy checks.

Owns:
- copy linting rules
- banned patterns
- tone checks
- disclosure requirements
- asset quality thresholds
- channel-specific policy packs

Does not own:
- editing content automatically beyond safe normalization

### `packages/analytics_events`

Responsible for event taxonomy and analytics emission.

Owns:
- canonical event names
- event schemas
- operational metrics hooks
- attribution across campaign, asset, review, and publish flows

Does not own:
- warehouse-specific BI dashboards

### Shared support packages

- **`connector-sdk`** for a common interface across publishing destinations.
- **`design-tokens`** for dashboard and creative UI consistency.
- **`shared-types`** for stable DTOs, schemas, and event payload contracts.

## 4. Workflow states

The system should model workflows as explicit state machines rather than boolean flags.

### Campaign lifecycle

```text
draft
→ in_composition
→ asset_ready
→ review_requested
→ changes_requested
→ approved
→ scheduled
→ queued_for_publish
→ publishing
→ published
→ post_publish_review
→ archived
```

### Aura / campaign state overlay

A campaign can also carry a non-terminal aura state used for presentation and routing:

- `incubating`
- `charged`
- `announced`
- `live_drop`
- `afterglow`
- `retired`

This overlay is useful for dashboard filtering, template selection, and analytics segmentation without mutating the underlying operational lifecycle.

### Asset lifecycle

```text
ingested
→ validating
→ needs_fix
→ transformed
→ packaged
→ qa_ready
→ approved_for_use
→ attached_to_campaign
→ published_reference
→ archived
```

### Publish job lifecycle

```text
pending_preflight
→ blocked
→ ready
→ dispatched
→ connector_accepted
→ posted
→ failed_retryable
→ failed_terminal
→ reconciled
```

### Review task lifecycle

```text
open
→ under_review
→ approved
→ rejected
→ superseded
→ expired
```

## 5. Scheduler design

The scheduler should be deterministic, auditable, and conservative.

### Core rules

- Scheduler creates **publish intents**, not direct posts.
- Every intent must reference an approved review artifact and a frozen template version.
- Schedule execution must re-run preflight checks before queue dispatch.
- Channel-specific quiet hours, event windows, and brand blackout periods must be configurable.
- Priority ordering should prefer live event communications, release-critical drops, and operator-marked urgent items.

### Scheduling model

Use two cooperating components:

1. **Planning scheduler**
   - Computes upcoming windows.
   - Expands recurring campaign rules.
   - Creates pending publish intents.

2. **Execution scheduler**
   - Watches near-term intents.
   - Revalidates approval, asset readiness, and connector health.
   - Pushes jobs into `publish_queue` when constraints still pass.

### Required scheduler safeguards

- idempotent intent generation
- no auto-backfill flood after outages
- max publishes per channel per time window
- event-level locking to prevent duplicate dispatch
- operator pause switch at global, channel, and campaign levels

## 6. Brand guardrail system

Guardrails should be implemented as a policy engine with explainable failures.

### Policy classes

- **Voice policies:** tone, prohibited phrasing, formatting style, capitalization rules, emoji policy, disclosure format
- **Asset policies:** minimum resolution, aspect ratio constraints, watermark rules, color treatment, logo spacing, file-size limits
- **Campaign policies:** required metadata, ownership tagging, event linkage, region restrictions, sponsorship disclosure
- **Platform policies:** destination-specific text length, hashtag limits, link handling, media count limits
- **Risk policies:** duplicate copy detection, overposting detection, deceptive-claim blocking, unsafe automation patterns

### Enforcement modes

- `advisory` — warning shown to operator
- `blocking` — must be fixed before review or publish
- `approval_escalation` — requires a higher-privilege reviewer

### Review outputs

Each guardrail evaluation should emit:
- rule identifier
- severity
- message
- affected field or asset
- suggested remediation
- policy pack version

## 7. Publishing connectors abstraction

The connector layer should isolate platform volatility from domain logic.

### Common connector contract

Each connector should implement the following operations:

- `validateDestinationConfig()`
- `validatePayload()`
- `previewPayload()`
- `publish()`
- `fetchPublishResult()`
- `deleteOrRollback()` where platform support exists
- `healthcheck()`

### Connector payload model

Normalize outbound messages into a common schema:

- destination account / channel
- content body
- media attachments
- alt text / accessibility metadata
- scheduled time
- tracking metadata
- disclosure metadata
- idempotency key

### Design requirements

- No connector should accept raw campaign objects.
- All connectors consume a frozen `PublishPacket` assembled upstream.
- Connector responses must be normalized into a common `PublishResult` shape.
- Support dry-run previews for operator review.
- Platform-specific quirks belong in adapter code, never in campaign domain models.

## 8. Content template engine

Templates should be structured, versioned, and composable.

### Template model

Each template definition should include:
- template id
- semantic version
- channel or use-case scope
- variable schema
- fallback defaults
- composition blocks
- validation rules
- rendering strategy

### Template categories

- community drop announcement
- sticker/media release note
- DJ/event announcement
- recap / afterglow post
- landing page hero copy
- email or newsletter block
- Discord/community bulletin

### Rendering approach

Use typed variables and deterministic rendering, not free-form prompt spaghetti.

Recommended flow:
1. campaign provides structured facts
2. template selects the right content skeleton
3. optional assistive generation proposes text variations
4. brand guardrails lint the output
5. operator edits and approves frozen result

### Versioning rules

- Existing approved campaigns keep their resolved template version.
- New renders default to latest compatible version.
- Breaking template changes require a new major version.

## 9. Asset pipeline status tracking

The asset pipeline should make readiness visible and measurable.

### Asset entities

- **AssetSource:** original uploaded or linked file
- **AssetDerivative:** transformed output such as resized image, captioned video, cropped story card
- **AssetPackage:** channel-ready collection of derivatives and metadata
- **AssetUsage:** reference from campaign, template slot, or published artifact

### Required statuses per asset package

- source verified
- rights confirmed
- metadata complete
- renditions generated
- accessibility fields complete
- brand QA passed
- approved for campaign use
- published references attached

### Operator visibility

The dashboard should show:
- which campaigns are blocked by asset issues
- which assets are missing alt text or rights metadata
- which derivatives are stale relative to source revision
- which packages are approved per destination

## 10. Admin/operator dashboard requirements

The dashboard is the control plane and should be designed around confidence, not novelty.

### Core views

#### Campaign workspace
- campaign summary
- aura state and lifecycle state
- linked assets
- template selection
- scheduled publishes
- review history
- analytics snapshot

#### Review inbox
- pending approvals
- blocking guardrail issues
- preview diffs between versions
- approve / reject / request changes actions

#### Asset console
- ingestion status
- failed transformations
- package readiness by channel
- metadata completeness

#### Release calendar
- upcoming publishes
- blackout windows
- event-linked releases
- channel load view

#### Connector health view
- auth status
- recent failures
- rate-limit warnings
- platform-specific constraints

#### Audit and analytics view
- who changed what and when
- publish outcomes
- review turnaround times
- campaign performance events

### RBAC requirements

Minimum roles:
- **admin** — policy, connector, and system settings
- **operator** — create campaigns, edit templates in bounds, request review
- **reviewer** — approve or reject publish-ready items
- **analyst** — read-only access to metrics and logs

### Non-negotiable UX requirements

- clear preflight status before queueing
- immutable approved snapshot before publish
- side-by-side preview for channel variants
- explicit manual publish confirmation
- visible rollback or follow-up action path after failures

## 11. Module interaction model

### Primary event flow

1. Operator creates or updates campaign in dashboard.
2. `lore_state_engine` records lifecycle and aura state.
3. `stix_asset_pipeline` ingests and prepares media assets.
4. `template_registry` renders draft content variants.
5. `brand_guardrails` evaluates copy, metadata, and assets.
6. `operator_review` issues a review task once blocking checks pass.
7. Reviewer approves a frozen snapshot.
8. `campaign_scheduler` creates timed publish intents.
9. `publish_queue` dispatches approved packets through connector adapters.
10. `analytics_events` records operational and post-publish signals.

### Failure handling

- Guardrail failure returns the campaign to `changes_requested`.
- Asset failure keeps campaign in `in_composition` or `asset_ready` with a blocking issue.
- Connector failure moves publish job to retryable or terminal states and notifies operators.
- Policy pack changes never silently mutate previously approved publish packets.

## MVP scope

The MVP should focus on one premium workflow done reliably.

### In scope

- campaign authoring and state machine
- asset intake for image/video packages
- template registry for 3–5 content types
- blocking brand guardrails for copy and asset metadata
- manual review and approval
- scheduler with one-time and simple recurring releases
- publish queue with 2–3 connectors
- operational analytics and audit log
- operator dashboard with campaign, review, asset, and calendar views

### Suggested first connectors

Choose low-risk, high-control destinations first:
- web CMS or site feed
- Discord announcement channel
- email/newsletter provider

Defer higher-volatility consumer social connectors until the review and packet model is stable.

## Future scope

- richer multi-step campaigns with coordinated channel sequencing
- AI-assisted copy ideation under strict guardrails
- automated rendition generation for additional formats
- event-triggered campaign activation from approved upstream systems
- localization pipeline
- per-community audience segmentation
- deeper attribution and revenue-adjacent reporting
- mobile reviewer experience
- approval policies tied to sponsorship or legal sensitivity

## Implementation phases

### Phase 0: foundation
- establish monorepo tooling
- define package contracts and shared schemas
- stand up PostgreSQL, storage, queue, and observability baseline
- write workflow and guardrail ADRs

### Phase 1: campaign core
- implement `lore_state_engine`
- implement `operator_review`
- implement `template_registry`
- create dashboard campaign workspace and review inbox

### Phase 2: asset and quality controls
- implement `stix_asset_pipeline`
- implement `brand_guardrails`
- add asset console and preflight summaries

### Phase 3: scheduling and publishing
- implement `campaign_scheduler`
- implement `publish_queue`
- add first connector set and failure handling
- launch release calendar and connector health views

### Phase 4: analytics and refinement
- implement `analytics_events`
- add operational metrics, funnel reporting, and SLA views
- improve approval ergonomics, previews, and auditability

## Risks

### Product risks
- over-automation pressure can erode operator trust if guardrails are too permissive
- unclear ownership between campaign author and reviewer can slow releases
- brand rules that are too rigid can make high-touch campaigns feel generic

### Technical risks
- connector APIs change frequently and can destabilize publish flows
- media transformation workloads can sprawl without strict job boundaries
- queue retries can create duplicate posts if idempotency is weak
- template sprawl can create inconsistent content unless versions are governed

### Operational risks
- asset rights and attribution metadata may be incomplete at ingestion time
- review SLAs can become a release bottleneck during event-heavy periods
- analytics can become noisy if event taxonomy is not frozen early

## Recommended implementation posture

- Start with a narrow connector set and a strong approval model.
- Treat approved publish packets as immutable release artifacts.
- Keep policy packs versioned and explainable.
- Prefer typed templates plus human editing over fully generative posting.
- Measure operator confidence, review turnaround, and publish reliability before expanding scope.
