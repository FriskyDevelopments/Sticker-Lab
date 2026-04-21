# GeminiPUP Admin Runtime Contract

This document defines the expected runtime behavior for GeminiPUP when operating across an **Admin Lounge** and one or more **main target groups**.

## 1. Objectives

- Respect owner/alpha authority in the admin group.
- Prevent unauthorized self-linking to random groups.
- Support distinct personas/modes with deterministic routing.
- Avoid echo-only responses for creative/admin tasks.

## 2. Authority model

### 2.1 Roles

- **Owner (Alpha-0):** the primary operator configured by `owner_user_id`.
- **Alpha Admin:** allowlisted admin operators.
- **Admin Group Member:** users in the admin group without operator privileges.
- **Main Group Member:** users in linked target groups.

### 2.2 Policy

- If `sender_user_id == owner_user_id`, commands and prompts are always treated as alpha-authorized.
- In admin lanes, owner requests override default playful behavior and should route to assistant-grade output.
- Admin-only commands must return explicit deny reasons when rejected (e.g., `not_alpha`, `not_admin_group`, `bot_not_admin`).

## 3. Admin group linking handshake

`/link_group` must be a two-step challenge flow, not a direct bind.

### 3.1 Step A — request from admin lounge

When `/link_group` is sent in the configured admin group:

1. Validate sender is owner/alpha.
2. Generate one-time `link_code` (8-12 chars), TTL 10 minutes, single use.
3. Persist pending link record:
   - `code`
   - `admin_group_id`
   - `requested_by`
   - `expires_at`
   - `status = pending`
4. Reply in admin group with instructions:
   - "Post `/link_code <code>` in the main group where you want me linked."

If `/link_group` is sent outside admin group, reject with:
- "Run this command from your admin lounge."

### 3.2 Step B — confirmation in target group

When `/link_code <code>` is posted in any group:

1. Validate bot membership in that target group.
2. Validate sender has admin rights in that target group.
3. Resolve pending code and verify unexpired + unused.
4. Create link (`admin_group_id` <-> `target_group_id`) idempotently.
5. Mark code consumed.
6. Confirm in both groups:
   - Target group: link success.
   - Admin group: include linked group id/title.

### 3.3 Safety constraints

- Max one active pending link code per admin group.
- Rate limit `/link_group` generation (e.g., 3/hour).
- Log all link attempts with decision and reason.

## 4. Persona and mode runtime

### 4.1 Required personas

- `puppy` (default, playful/short)
- `admin_assistant` (clear operational support)
- `alchemy_curator` (creative ideation/campaign writing)
- `antigravity_dev` (technical/debug framing)

### 4.2 Mode switching

Slash commands should set a **chat-scoped mode** with explicit acknowledgement:

- `/alchemy` -> `alchemy_curator`
- `/antigravity` -> `antigravity_dev`
- `/admin_mode` -> `admin_assistant`
- `/puppy_mode` -> `puppy`

A mode-switch acknowledgement must include:

- Active persona label
- Scope (`this chat`)
- TTL or persistence rule (`until changed` or duration)

### 4.3 Routing rules

- In admin group, default to `admin_assistant` for non-trivial requests (planning, promo writing, operations).
- In regular groups, default to `puppy` unless explicitly switched.
- Owner prompts in admin group should never be handled as raw echo/parrot output.

### 4.4 Echo suppression

If generated output is semantically equivalent to input (near-duplicate), retry generation with:

- higher instruction weight
- persona reminder
- minimum response expansion policy

After retry failure, return structured fallback:
- "I couldn't generate a useful response; try `/admin_mode` or add details."

## 5. Promo workflow expectation

When operator sends `promo` then a follow-up prompt (e.g., "make a promo for pups to join VC"):

1. Enter promo-capture state for next message in same chat.
2. Interpret follow-up as content request, not plain echo.
3. Generate a formatted promo draft with CTA, tone, and optional variants.

## 6. Acceptance tests (minimum)

1. **Owner authority:** owner asks for promo in admin lounge -> actionable drafted promo.
2. **Unauthorized link attempt:** `/link_group` in non-admin group -> denied.
3. **Valid link handshake:** `/link_group` (admin) + `/link_code` (target) -> link succeeds.
4. **Mode fidelity:** `/alchemy` then user asks for creative copy -> output matches creative persona.
5. **Admin persona fidelity:** `/admin_mode` then user asks operational question -> concise structured answer.
6. **No-parrot guard:** input `hi` does not return only `hi` unless explicitly asked for mirroring.

## 7. Telemetry and debugging

Emit per-message trace metadata:

- `chat_id`
- `sender_id`
- `sender_role`
- `resolved_persona`
- `intent`
- `policy_decision`
- `response_quality_flag` (`ok`, `echo_blocked`, `fallback`)

Store last 50 traces per chat for `/debug_last` (alpha only).
