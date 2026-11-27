# Security Policy

## Supported scope

This policy applies to the public Redlighte application repository and its documented application components. Related private infrastructure and the `redlighte-data` repository may have separate access controls and policies.

## Reporting a vulnerability

Please do not publish exploit details, credentials, personal data, or an unpatched vulnerability in a public issue or discussion.

Use GitHub's **Report a vulnerability** / private vulnerability reporting feature for this repository if it is enabled. If private reporting is unavailable, contact the repository owner privately through an established channel and share only the minimum information needed to reproduce and assess the issue.

Do not assume that a public issue is a safe place for sensitive security reports.

## Security expectations

- Keep API tokens, GitHub credentials, signing keys, OAuth secrets, and service credentials in server-side secret storage.
- Never commit secrets, private user data, production exports, or authentication tokens.
- Do not expose privileged data-repository credentials to frontend JavaScript.
- Validate and authorize every request that reads or changes account-specific data.
- Treat all client input and external content as untrusted.
- Use secure session-cookie attributes and protect session lifecycle operations.
- Apply least-privilege permissions to GitHub and Cloudflare credentials.
- Avoid logging passwords, tokens, session cookies, or sensitive personal information.
- Review dependencies and third-party integrations before introducing them.

## Authentication notes

The repository README documents PBKDF2/SHA-256 password hashing and HMAC-SHA-256 session signing. These descriptions do not replace a current code review. Confirm supported iteration counts, parameter storage, comparison behavior, session expiration, rotation, and cookie settings against the deployed implementation.

## Response and remediation

Security reports should be triaged privately. Assess impact, affected versions/components, exploitability, and data exposure. Prepare a fix, test it, and coordinate disclosure after a remediation is available. Do not promise a response time that the project has not formally committed to.

## Scope limitation

This file is a project security policy, not a certification or guarantee that the application is free of vulnerabilities.
