# Release and Rollback Checklist

Use this checklist before promoting any future STIX/LORE automation system to production.

## Pre-release checks

- [ ] `python scripts/validate_brand_system.py` passes.
- [ ] Architecture docs match implemented package boundaries.
- [ ] Environment variables are documented and validated at startup.
- [ ] CI checks pass on the target commit.
- [ ] Manual approval workflow is enabled for publishing.
- [ ] Production secrets were reviewed and are not expired.

## Deployment checks

- [ ] Deploy from a protected branch/tag only.
- [ ] Confirm migration plan (if schema changes exist).
- [ ] Verify health endpoint after deploy.
- [ ] Run one smoke test campaign in a safe channel.
- [ ] Verify event emission for enqueue, review, publish-result.

## Post-release checks

- [ ] Review error logs for first 30 minutes.
- [ ] Confirm retry/dead-letter rates are normal.
- [ ] Confirm no duplicate posts were created.
- [ ] Confirm dashboards/alerts are receiving fresh events.

## Rollback plan

If critical failures appear:

1. Pause scheduler dispatch.
2. Disable publish workers.
3. Revert to previous stable build.
4. Re-run smoke checks.
5. Re-enable traffic gradually.
6. Document incident details and follow-up actions.

## Change record template

```text
Release ID:
Date/Time (UTC):
Operator:
Scope:
Checks completed:
Rollback needed (yes/no):
Notes:
```
