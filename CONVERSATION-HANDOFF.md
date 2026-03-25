# Session Handoff — 24 March 2026 (Session 2)

## Completed This Session
1. **Audited all 7 reference docs** — STRATEGIC-PLAN.md, ARCHITECTURE.md, DATABASE-SCHEMA.md, FILE-MAP.md, API-REFERENCE.md, CODING-STANDARDS.md, COMPLIANCE.md all scored as ship-ready with zero WordPress leakage
2. **Deleted 40+ old WP-era docs** — root-level reports, docs/ subdirectory files, all cleaned
3. **Deleted 6 WP-only rules** — 01-wordpress-multisite, 02-sftp-deployment, 04-um-roles, 09-constants, 14-shafi-chatbot, 15-file-organisation
4. **Rewrote 10 rules for TypeScript/NestJS** — medical-security, frontend-first, dashboard-widgets, offline-first, accessibility, database-patterns, testing, error-handling, icd11-codes, humanitarian-context
5. **Created 14-shifa-bot.md** — new rule for Shifa Bot (AWS Bedrock, admin-assist only)
6. **Rewrote root CLAUDE.md** — now points to .claude/CLAUDE.md for Medinova SaaS context
7. **Generated interactive brief** — A:/.openclaw/.interactive-briefs/2026-03-24-medinova-strategic-plan.html (15 sections, 4 decisions, 1 blocking)
8. **Deleted 4 outdated interactive briefs** — from WP-era sessions

## Current State
- **Branch:** main (uncommitted changes — documentation transition)
- **Tests:** No test suite (SaaS rebuild starts fresh next session)
- **Build:** n/a (monorepo not scaffolded yet)
- **All reference docs:** Medinova-ready, NestJS/Next.js/PostgreSQL throughout
- **All rules:** TypeScript/NestJS, zero PHP/WordPress references
- **Interactive brief:** Ready for review at A:/.openclaw/.interactive-briefs/

## Known Issues / Blockers
- Domain availability for "medinova" not yet verified (medinova.com, medinova.health, getmedinova.com)
- Biomedical Catalyst current round may be closed. Next round likely summer 2026
- Monorepo not yet scaffolded — that's the next session's primary task

## Next Priorities (in order)
1. **Commit documentation transition** — stage all changes, commit to main or feature branch
2. **Scaffold Medinova monorepo** — pnpm workspaces, Turborepo, apps/api (NestJS), apps/web (Next.js), packages/contracts, packages/db, packages/ui, packages/config
3. **Set up CI/CD** — GitHub Actions: lint, type-check, test, build
4. **Create Drizzle schema** — shared tables (tenants, users, roles, permissions, user_tenants) + tenant schema template (patients, appointments, encounters, etc.)
5. **Verify `pnpm dev` runs** — both API and web apps start successfully
6. **Check domain availability** — medinova.com, medinova.health, getmedinova.com, medinova.io

## Files Modified This Session
| File path | What changed |
|-----------|-------------|
| CLAUDE.md (root) | Rewritten — now redirects to .claude/CLAUDE.md |
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
| 40+ old .md files | Deleted (WP-era docs and reports) |
| .claude/rules/01,02,04,09,14-old,15 | Deleted (WP-only rules) |
| A:/.openclaw/.interactive-briefs/*.html | 4 deleted, 1 created |

## Notes for Next Session
- Review the interactive brief before starting: `A:/.openclaw/.interactive-briefs/2026-03-24-medinova-strategic-plan.html` — 4 decisions need your input (market entry is blocking)
- The monorepo scaffold should follow FILE-MAP.md exactly
- Use Context7 MCP to get current NestJS 11, Drizzle ORM, and ts-rest docs before scaffolding
- Start with `pnpm init` + workspace config, then scaffold apps and packages in parallel

## Next Session Prompt

~~~
/using-superpowers

Read CONVERSATION-HANDOFF.md and .claude/CLAUDE.md for full context. This session: scaffold the Medinova monorepo.

## Skills to Invoke

| Skill | When |
|-------|------|
| `/using-superpowers` | FIRST |
| `/strategic-plan` | Reference — read STRATEGIC-PLAN.md for module list |
| `/software-architecture` | Reference — read ARCHITECTURE.md for layer design |
| `/test-driven-development` | When writing first tests |

## MCP Servers & Tools

| Tool | What for |
|------|----------|
| Context7 | Current docs: NestJS 11, Drizzle ORM, ts-rest, next-intl, Serwist |
| GitHub MCP | Create the medinova repository |

## Agents

| Agent | When |
|-------|------|
| `feature-dev:code-architect` | Design NestJS module structure |
| `test-and-explain` | After scaffold — verify pnpm dev works |

## Tasks (in order)

1. **Create GitHub repo** — `medinova` under Bean's account. Private. MIT licence
2. **Scaffold monorepo** — follow FILE-MAP.md structure exactly:
   - Root: pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .env.example
   - apps/api/ — NestJS 11 app with module structure per ARCHITECTURE.md
   - apps/web/ — Next.js 15 app with App Router, shadcn/ui, next-intl
   - packages/contracts/ — ts-rest API contracts
   - packages/db/ — Drizzle schema + migrations per DATABASE-SCHEMA.md
   - packages/ui/ — shared React components
   - packages/config/ — shared ESLint, TypeScript, Prettier configs
3. **Configure CI/CD** — GitHub Actions: lint, type-check, test, build on PR
4. **Create Drizzle schema** — shared tables first (tenants, users, roles, permissions, user_tenants)
5. **Verify** — `pnpm install && pnpm dev` starts both apps. `pnpm test` runs (even if no tests yet)
6. **Gate check** — `pnpm dev` runs, DB migrations work, CI passes

## Guardrails
- Product: Medinova. AI: Shifa Bot. Charity: HelpingDoctors.org
- Never suggest interest-bearing loans (haram)
- Schema-per-tenant PostgreSQL. Not MySQL
- Claude via AWS Bedrock. Not Cloudflare Workers AI
- Quality > speed. Complete implementations only
- UK English always
~~~
