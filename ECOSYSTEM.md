# Redlighte Ecosystem

> Brand and product map for the Redlighte project.

## Brand hierarchy

**REDLIGHTE** is the umbrella identity. **Redlighte Inc.** is the parent brand used to describe the ecosystem; this wording describes the project's brand architecture and does not, by itself, make a statement about legal incorporation.

The ecosystem is made up of distinct products and experiences. **Redlighte.ir** is the main AI product, not a synonym for every branch.

```text
REDLIGHTE
└── Redlighte Inc. (parent brand)
    ├── Redlighte.ir / Redlighte AI
    ├── Redlighte Articles
    ├── Redlighte Agents
    ├── Redlighte Room
    ├── Redlighte Now
    ├── Redlighte Game
    └── Vault
```

## Product map

| Product | Current documented role | Repository location |
|---|---|---|
| Redlighte AI | Main Persian-first conversational AI experience | Root application |
| Articles | Editorial content, technology and AI news, guides, gaming content | `/articles/` |
| Agents | Specialized AI-agent experiences | `/agents/` |
| Room | Shared rooms and real-time collaboration | `/room/` |
| Now | Public-facing activity and status view | `/now/` |
| Game | Browser games and social gaming features | `/game/` |
| Vault | Authenticated personal storage for user content | `/vault/` |

The product descriptions above reflect the repository's current README-level documentation. They are not a guarantee that every feature is enabled in every production environment.

## Shared platform capabilities

The ecosystem shares a web presence and a Cloudflare Worker backend. Depending on the feature, shared capabilities include account/session handling, AI inference, persistent application data, and real-time room infrastructure.

Products should remain clearly identifiable while reusing shared platform services where appropriate. A product-specific change should not silently alter unrelated products.

## Product boundaries

- Redlighte AI is the primary assistant experience.
- Articles is an editorial/content product; it should not be treated as the source of truth for account data.
- Agents represents specialized agent experiences.
- Room owns shared-room and live collaboration experiences.
- Now exposes public project signals only; private user data must not be published there.
- Game owns game and social-gaming experiences.
- Vault owns personal saved items and collections.

## Naming and brand rules

1. Use **Redlighte** for the ecosystem identity.
2. Use **Redlighte Inc.** as the parent-brand label in ecosystem diagrams.
3. Use **Redlighte AI** for the main assistant product.
4. Keep product names and routes consistent with this document.
5. Do not imply that a planned, unavailable, or unverified capability is live.

## Updating this map

When a product is added, renamed, moved, or retired, update this file and the README product table in the same documentation change. Include its purpose, route, ownership boundary, and any shared backend dependency that is confirmed in code.
