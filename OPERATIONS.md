# Operations Guide

## 1. Scope

Operational notes for the Redlighte web application and its Cloudflare Worker. Confirm the live environment before executing any operational action; repository documentation may lag behind production.

## 2. Deployment shape

The repository README documents a Cloudflare Worker entry point at `worker/index.js`, configuration in `wrangler.jsonc`, and static assets served through the Worker asset binding. The project is documented as not requiring a large frontend build pipeline.

## 3. Pre-deployment checklist

- Confirm the intended repository, branch, and commit.
- Review the complete diff; keep changes limited to the requested scope.
- Check JavaScript syntax and any available automated tests.
- Verify Worker bindings, Durable Object migrations, routes, and compatibility date.
- Confirm required secrets exist in the target environment without printing them.
- Confirm access to the private data repository using least-privilege credentials.
- Verify AI binding/model availability if AI behavior changed.
- Check authentication, account data isolation, and affected product flows.
- Prepare a rollback path before production deployment.

## 4. Configuration and secrets

The README documents `wrangler.jsonc` as the Worker configuration file. Never store secret values in tracked configuration, source code, issues, or logs. Use the platform's secret-management mechanism and verify the target environment before changing values.

Do not copy production credentials into local examples or documentation.

## 5. Monitoring and diagnosis

Use Cloudflare Worker logs, deployment status, and observability configured for the service. When investigating an incident:
1. record the time window and affected route/product;
2. capture request identifiers and error classes without collecting sensitive payloads;
3. determine whether the failure is frontend, Worker, AI provider, Durable Object, or data-store related;
4. make the smallest safe fix;
5. verify the affected flow and adjacent flows.

Never include passwords, tokens, cookies, or private user content in diagnostic reports.

## 6. Data-store dependency

The application is documented as using a separate private GitHub repository for user/application data. Check API permissions, rate limits, response status, and repository availability when diagnosing persistence problems. Do not expose the private repository token or data contents.

## 7. Recovery and rollback

Before a schema or data-format change, define compatibility with existing records and a recovery plan. For application regressions, prefer reverting the smallest relevant commit or deploying a known-good revision. Data migrations require a separate restore strategy; rolling back application code alone may not reverse data changes.

## 8. Incident notes

For each significant incident, record:
- date/time and affected product;
- user-visible impact;
- root cause (once verified);
- remediation commit/deployment;
- validation performed;
- follow-up prevention work.

Do not state an unverified hypothesis as the root cause.
