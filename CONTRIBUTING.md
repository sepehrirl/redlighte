# Contributing to Redlighte

## Project principle

Redlighte is a multi-product ecosystem. Contributions should improve the requested area without causing unrelated changes elsewhere.

## Before changing code

1. Identify the exact product, route, Worker module, or documentation file in scope.
2. Read the relevant existing implementation and documentation.
3. Check whether the change affects shared authentication, data access, APIs, or another product.
4. State assumptions when implementation details are not confirmed.
5. Avoid broad refactors when a focused fix is sufficient.

## Change boundaries

- Change only what the task requests.
- Do not modify unrelated pages, styles, assets, APIs, or configuration.
- Do not delete or replace existing content unless explicitly requested or required and explained.
- Preserve established product naming and route conventions.
- Never commit secrets, private data, generated credentials, or production exports.

## Implementation quality

- Keep code consistent with the existing lightweight HTML/CSS/JavaScript and Cloudflare Worker architecture unless an architectural change is approved.
- Validate user input and enforce server-side authorization.
- Consider mobile and responsive behavior.
- Preserve accessibility, localization, and Persian right-to-left behavior where relevant.
- Avoid adding dependencies without a clear need.
- Update documentation when behavior, endpoints, configuration, or data handling changes.

## Validation

Run checks appropriate to the changed area. At minimum:
- inspect the full diff;
- check syntax for modified JavaScript;
- test the affected user flow;
- test relevant authentication/authorization boundaries;
- verify that unrelated product areas remain unchanged.

Report checks that were not run; do not claim tests passed without evidence.

## Pull requests and commits

Use a concise commit message describing the scoped change. A pull request should include:
- purpose and affected product/module;
- summary of behavior changes;
- tests and manual verification;
- configuration or migration requirements;
- screenshots for meaningful UI changes when practical;
- known limitations and rollback considerations.

## Documentation-only changes

Keep documentation aligned with verified source behavior. Clearly label assumptions, planned work, and items requiring production verification.
