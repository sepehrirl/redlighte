# Data Governance

## 1. Purpose

This document records the data-handling boundaries that should guide development across the Redlighte ecosystem. It is not a complete legal privacy notice and does not replace the live product's user-facing disclosures.

## 2. Repository separation

The documented architecture separates:
- the public application repository, which contains application code and public assets;
- the private `redlighte-data` repository, which is accessed by server-side application logic for authenticated application data.

Credentials that grant access to private data must never be shipped to the browser or committed to the public repository.

## 3. Documented data categories

The README describes application data that may include:
- account records and authentication/session-related records;
- conversations and chat history;
- long-term memory entries;
- game and social-game state;
- device-input logs for authenticated accounts;
- Google-account mappings;
- Vault items, collections, tags, favorites, and trash state.

This list is based on repository documentation. Confirm actual stored fields and enabled collection behavior in the current Worker and private data repository before making user-facing claims.

## 4. Data minimization and access

- Collect only data required for a clearly defined product function.
- Keep account-specific data behind server-side authorization checks.
- Enforce per-user ownership boundaries on every read, update, restore, export, and delete operation.
- Do not expose private account data through public endpoints, public activity feeds, or client-side source files.
- Keep diagnostic logs free of credentials and unnecessary personal data.
- Restrict service credentials to the minimum repository and API permissions needed.

## 5. Memory and user control

The README documents memory features such as extraction, retrieval, manual creation/editing/deletion, clearing, and enable/disable controls. The exact behavior and user controls must be verified against the current implementation.

Memory should be relevant, limited, and handled separately from ordinary transient conversation context. Sensitive information should not be stored unless the product has a clear, disclosed, and appropriate basis for doing so.

## 6. Retention and deletion

Do not invent retention periods. Document a retention period only after confirming the implementation and product policy. Deletion workflows should define whether data is soft-deleted, recoverable, permanently deleted, or replicated in backups.

Before changing data schemas or deletion behavior, assess all affected products and migration/recovery requirements.

## 7. Public information

Redlighte Now is documented as exposing public project signals only. It must not reveal private user content, account records, chat content, memory, Vault items, credentials, or internal operational secrets.

## 8. Changes to data handling

Any new data category or collection behavior should have:
1. a documented product purpose;
2. a clear owner and access boundary;
3. a minimization assessment;
4. defined retention and deletion behavior;
5. authorization and security tests;
6. an update to this document and relevant user-facing disclosures where required.
