# Session Handoff — 25 March 2026

## Completed This Session
1. **Audited all 7 Medinova reference docs** — STRATEGIC-PLAN.md, ARCHITECTURE.md, DATABASE-SCHEMA.md, FILE-MAP.md, API-REFERENCE.md, CODING-STANDARDS.md, COMPLIANCE.md. All scored ship-ready with zero WordPress leakage.
2. **Deleted 40+ old WP-era docs** — root-level reports (BUG-FIXES-APPLIED, BUSINESS-MODEL, ROADMAP, etc.), docs/ subdirectories (guides, specifications, session-management). All WP-era documentation removed.
3. **Retired 6 WP-only rules** — 01-wordpress-multisite, 02-sftp-deployment, 04-um-roles, 09-constants, 14-shafi-chatbot, 15-file-organisation.
4. **Rewrote 10 rules for TypeScript/NestJS** — medical-security, frontend-first, dashboard-widgets, offline-first, accessibility, database-patterns, testing, error-handling, icd11-codes, humanitarian-context. Zero PHP/WordPress references remain (verified by grep).
5. **Created 14-shifa-bot.md** — new rule for Shifa Bot on AWS Bedrock, admin-assist only, Phase 3.
6. **Rewrote root CLAUDE.md** — now redirects to .claude/CLAUDE.md for full Medinova context.
7. **Made 4 strategic decisions with Bean:**
   - Market entry: validation shifts to month 2-3 with working demo (not mockups). Bean's bandwidth limited by Indus/SGS dependency. Outreach via Muslim business network groups, not cold outreach.
   - Pricing: approved as-is (79/399/1800/custom). Revisit with real clinic feedback.
   - Success metrics: adjusted timeline — demand validation week 8-10, first beta week 12, first paid week 18, kill date month 5.
   - Session plan: approved as-is. Monorepo scaffold is next.
8. **Updated STRATEGIC-PLAN.md** with all decision outcomes and adjusted timeline.

## Current State
- **Branch:** main at addc49f
- **Tests:** No test suite (SaaS rebuild starts fresh next session)
- **Build:** n/a (monorepo not scaffolded yet)
- **Uncommitted changes:** None (settings.local.json and public_html submodule are pre-existing)

## Known Issues / Blockers
- Domain availability for "medinova" not yet verified (medinova.com, medinova.health, getmedinova.com)
- Bean's bandwidth limited until Indus ships (SGS theme builder dependency). Outreach starts month 2-3, not now.
- Biomedical Catalyst current round likely closed. Next round summer 2026.

## Next Priorities (in order)
1. **Scaffold Medinova monorepo** — pnpm workspaces, Turborepo, apps/api (NestJS 11), apps/web (Next.js 15), packages/contracts, packages/db, packages/ui, packages/config. Follow FILE-MAP.md exactly.
2. **Set up CI/CD** — GitHub Actions: lint, type-check, test, build on PR.
3. **Create Drizzle schema** — shared tables first (tenants, users, roles, permissions, user_tenants), then tenant schema template.
4. **Verify gate** — `pnpm dev` starts both apps, `pnpm test` runs, CI passes.
5. **Check domain availability** — medinova.com, medinova.health, getmedinova.com, medinova.io.

## Files Modified
| File path | What changed |
|-----------|-------------|
| CLAUDE.md | Rewritten — redirects to .claude/CLAUDE.md |
| .claude/CLAUDE.md | Updated for Medinova standalone SaaS |
| STRATEGIC-PLAN.md | Market entry shifted to month 2-3, kill date month 5, milestones adjusted |
| CONVERSATION-HANDOFF.md | Full rewrite for this session |
| .claude/rules/03-medical-security.md | Rewritten for NestJS/TypeScript |
| .claude/rules/05-frontend-first.md | Rewritten for Next.js App Router |
| .claude/rules/06-dashboard-widgets.md | Rewritten for React + react-grid-layout |
| .claude/rules/07-offline-first.md | Rewritten for Serwist/idb/Next.js PWA |
| .claude/rules/08-accessibility.md | Rewritten for React/JSX + axe-core |
| .claude/rules/10-database-patterns.md | Rewritten for Drizzle ORM + PostgreSQL |
| .claude/rules/11-testing.md | Rewritten for Jest + Supertest + Vitest |
| .claude/rules/12-error-handling.md | Rewritten for NestJS exception filters |
| .claude/rules/13-icd11-codes.md | Rewritten for NestJS HttpService |
| .claude/rules/14-shifa-bot.md | Created — Shifa Bot rule (AWS Bedrock) |
| .claude/rules/16-humanitarian-context.md | Updated for NestJS/Next.js stack |
| 40+ deleted files | All WP-era docs and 6 WP-only rules |

## Notes for Next Session
- The monorepo scaffold should follow FILE-MAP.md exactly — it has the complete directory structure.
- DATABASE-SCHEMA.md has all 22 MVP table definitions with columns and types — use directly for Drizzle schema generation.
- API-REFERENCE.md has all 65 endpoints — use for ts-rest contract generation.
- Bean cannot do clinic outreach yet (Indus dependency). Build proceeds without customer input until month 2-3.
- All financing must be halal. Never suggest interest-bearing loans.

## Next Session Prompt

~~~
/using-superpowers

Read CONVERSATION-HANDOFF.md and .claude/CLAUDE.md for full context. This session: scaffold the Medinova monorepo and create the database schema.

## Skills to Invoke

| Skill | When to use |
|-------|-------------|
| `/using-superpowers` | FIRST — before any response |
| `/software-architecture` | Reference when designing NestJS module structure |
| `/superpowers:test-driven-development` | When writing first tests for the scaffold |
| `/research-check` | Quick lookup: latest NestJS 11 project setup, Drizzle schema-per-tenant patterns |

## MCP Servers & Tools

| Tool | What to use it for |
|------|-------------------|
| Context7 | Current docs: NestJS 11, Drizzle ORM, ts-rest, next-intl, Serwist |
| GitHub MCP | Create the medinova repository (private, MIT licence) |

## Agents to Delegate To

| Agent | When |
|-------|------|
| `feature-dev:code-architect` | Design NestJS module structure and Drizzle schema |
| `test-and-explain` | After scaffold — verify pnpm dev works, explain results |

---

## Task 1: Create GitHub Repository
Create `medinova` repo under Bean's account. Private. MIT licence. Clone locally.

## Task 2: Scaffold Monorepo
Follow FILE-MAP.md structure exactly:
- Root: pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .env.example
- apps/api/ — NestJS 11 with module structure per ARCHITECTURE.md
- apps/web/ — Next.js 15 with App Router, shadcn/ui, next-intl
- packages/contracts/ — ts-rest API contracts (shared types)
- packages/db/ — Drizzle schema + migrations per DATABASE-SCHEMA.md
- packages/ui/ — shared React components (shadcn/ui base)
- packages/config/ — shared ESLint, TypeScript, Prettier configs
Use Context7 to get current setup docs for NestJS 11 and Drizzle ORM.

## Task 3: Create Drizzle Schema
Implement shared tables first: tenants, users, roles, permissions, user_tenants (from DATABASE-SCHEMA.md). Then create the tenant schema template with patients, appointments, encounters tables. Use `/superpowers:test-driven-development` — write schema tests first.

## Task 4: Configure CI/CD
GitHub Actions workflow: lint, type-check, test, build on PR. Deploy pipeline can wait until production.

## Task 5: Verify
Run `pnpm install && pnpm dev` — both API and web apps must start. Run `pnpm test`. Use `test-and-explain` agent to validate and explain results.

## Guardrails
- Product: Medinova. AI: Shifa Bot. Charity: HelpingDoctors.org
- Never suggest interest-bearing loans (haram)
- Schema-per-tenant PostgreSQL, not MySQL
- Claude via AWS Bedrock, not Cloudflare Workers AI
- Quality > speed. Complete implementations only. No stubs or TODOs
- UK English always
- Zero `any` policy in TypeScript
~~~
