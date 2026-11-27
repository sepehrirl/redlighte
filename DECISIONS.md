# Architecture Decision Records

This file is a concise index of important project-level decisions. Add a dated record when a decision materially changes architecture, security, data ownership, or product boundaries.

## ADR-001 — Parent brand and product hierarchy

**Status:** Accepted  
**Decision:** Redlighte is the umbrella ecosystem identity. Redlighte Inc. is the parent-brand label. Redlighte.ir / Redlighte AI is the main AI product, with Articles, Agents, Room, Now, Game, and Vault as distinct branches.  
**Reason:** The ecosystem must not be represented as a single chat product.  
**Consequences:** Product names, route descriptions, and documentation should preserve this hierarchy. The parent-brand wording does not assert legal incorporation.

## ADR-002 — Separate public application and private user-data repositories

**Status:** Accepted (as documented architecture)  
**Decision:** Keep public application source separate from the private `redlighte-data` repository used by server-side application logic.  
**Reason:** Application code and private user/application records have different access requirements.  
**Consequences:** Data-repository credentials remain server-side; authorization and per-user access checks are mandatory. Verify the live repository integration before operational changes.

## ADR-003 — Cloudflare serverless application architecture

**Status:** Accepted (as documented architecture)  
**Decision:** Use Cloudflare Workers for server-side request handling, Workers AI for model inference, and Durable Objects/WebSockets for documented real-time Room functionality.  
**Reason:** A lightweight edge-hosted architecture supports the current web application and real-time product needs.  
**Consequences:** Bindings, migrations, compatibility dates, and provider limits must be checked before deployment.

## ADR-004 — Scoped changes by default

**Status:** Accepted  
**Decision:** A requested change must remain limited to the requested files and behavior; unrelated areas must not be modified.  
**Reason:** The ecosystem contains multiple connected products, and broad incidental changes create regressions.  
**Consequences:** Review diffs carefully and explain any unavoidable cross-product impact before proceeding.

## Adding a decision

Use this format:

- **ADR-NNN — Short title**
- **Date:** YYYY-MM-DD
- **Status:** Proposed / Accepted / Superseded
- **Context:** What problem required a decision?
- **Decision:** What was chosen?
- **Alternatives:** What else was considered?
- **Consequences:** What becomes easier, harder, or constrained?
