# Session Handoff — 2026-03-22

## Completed This Session
1. **Full project code review** with 4 specialist agents (code explorer, code reviewer, EHR security, duplication finder). Found 9 critical, 13 high, 20+ medium/low issues. Full report in chat history and saved to OpenClaw memory.
2. **Deep research** (93 sources, 30 read in depth) covering EHR market 2026, competition (KiviCare CVEs), regulation (DTAC, DSPT, MHRA, DUA Act), tech stack, offline-first architecture, AI clinical safety, BOGO model validation.
3. **Research-buddies** on SaaS vs WP architecture question. Nerd + Practical One, 2 rounds + discussions. Key finding: no UK healthcare SaaS uses WordPress; WP multisite prefix = zero tenant isolation.
4. **Internal debate** (Proposer, Challenger, Red Team). Proposer dropped from 82% to 51% confidence on WP-first. Red Team found Option D (headless WP). Bean rejected all options.
5. **Bean's final architecture decision:** Standalone SaaS on AWS is the product. WordPress is an optional frontend connector only. Data never lives on WP. Quality over speed. Commercial first, charity funded by commercial.
6. **STRATEGIC-PLAN.md written** (76 tasks, 16 weeks) but reflects pre-decision two-track architecture. MUST BE REWRITTEN next session to reflect standalone SaaS.
7. **Interactive briefs** generated at `.interactive-briefs/` and copied to `A:/.openclaw/.interactive-briefs/`. The strategic plan brief is outdated.
8. **OpenClaw Memory MCP** updated with 4 entities + 5 relations covering all findings and decisions.

## Current State
- **Branch:** main at 50094ee
- **Tests:** No test suite exists for the WP plugin
- **Build:** n/a (no build step for WP plugin)
- **Uncommitted changes:** .claude/settings.local.json (not session-related), public_html submodule (not session-related)
- **Interactive briefs:** saved locally at `.interactive-briefs/` and `A:/.openclaw/.interactive-briefs/` but strategic plan brief needs regenerating after rewrite

## Known Issues / Blockers
- STRATEGIC-PLAN.md reflects the two-track architecture (WP for Gaza + Next.js for commercial). Bean decided standalone SaaS first. Plan must be fully rewritten.
- ROADMAP.md is stale (written March 2026, assumes WP-plugin-first). Needs full rewrite.
- DECISION-BRIEF.md has factual errors: says KiviCare is WP-only (it has a Flutter app), frames Arabic as the primary language differentiator (should be 10+ languages).
- The interactive brief at `A:/.openclaw/.interactive-briefs/2026-03-22-helpingdoctors-strategic-plan.html` reflects the old two-track plan. Must be regenerated after the strategic plan rewrite.

## Next Priorities (in order)
1. **Rewrite STRATEGIC-PLAN.md** for standalone SaaS architecture. Tech stack decision needed (Laravel + Next.js? Next.js full-stack? Other?). Research the best stack for a healthcare SaaS built by one person with Claude/OpenClaw. Then rewrite the 16-week plan.
2. **Generate new interactive brief** from the rewritten plan and save to `A:/.openclaw/.interactive-briefs/`. Delete or archive the outdated one.
3. **Update ROADMAP.md, CLAUDE.md, BUSINESS-MODEL.md** to reflect standalone SaaS direction. Remove all WP-plugin-first assumptions.
4. **Begin implementation** of the standalone SaaS based on the new plan — starting with architecture scaffolding and security patterns ported from the existing codebase.
5. **SBRI grant application** — Claude drafts, Bean reviews. Working MVP demo + DTAC submission strengthens the application.

## Files Modified
| File path | What changed |
|-----------|-------------|
| DECISION-BRIEF.md | Created — deep research findings, 7 decisions, competitive analysis |
| STRATEGIC-PLAN.md | Created — 76-task 16-week plan (OUTDATED — needs rewrite for standalone SaaS) |
| .claude/CLAUDE.md | Updated — added March 2026 strategic decisions section |
| .interactive-briefs/2026-03-21-decision-brief.html | Created — interactive decision brief |
| .interactive-briefs/2026-03-22-strategic-plan.html | Created — interactive strategic plan brief (OUTDATED) |
| .gitignore | Updated — added .interactive-briefs/ |

## Notes for Next Session
- Bean's priorities are quality, reliability, sellability, UX, positive surprises. NOT speed. OpenClaw builds 24/7 so time constraints from the research (15 hrs/week) are wrong.
- Bean is in debt. Commercial side must come first. No AWS or charity deployments without revenue or grant funding.
- KiviCare has a Flutter app (not WP-only). Language support is 10+ languages (not just Arabic/English). Both corrections saved to memory.
- The existing 207 PHP files have valuable business logic (encryption, audit logging, FHIR, permissions, ICD-11) that should be mined for the SaaS rebuild, but the WP-specific code (hooks, shortcodes, wp_ajax, $wpdb) won't port directly.
- Schema-per-tenant PostgreSQL is the correct multi-tenancy model. MySQL/WP multisite prefix has zero tenant isolation.

## Next Session Prompt

~~~
/using-superpowers

Read CONVERSATION-HANDOFF.md and CLAUDE.md for full context, then work through these priorities:

## Skills to Invoke

| Skill | When to use |
|-------|-------------|
| `/using-superpowers` | FIRST — before any response |
| `/research-buddies` | Task 1 — research best SaaS tech stack for healthcare (Laravel vs Next.js vs other) |
| `/software-architecture` | Task 2 — design Clean Architecture for the standalone SaaS |
| `/strategic-plan` | Task 3 — rewrite STRATEGIC-PLAN.md for standalone SaaS |
| `/interactive-brief` | Task 4 — generate new brief from rewritten plan, save to A:/.openclaw/.interactive-briefs/ |
| `/claude-md-management:revise-claude-md` | Task 5 — update CLAUDE.md to reflect standalone SaaS direction |
| `/gap-analysis` | After each task — quality gate before proceeding |

## MCP Servers & Tools

| Tool | What to use it for |
|------|-------------------|
| Firecrawl | Research SaaS tech stacks, competitor architectures, healthcare SaaS patterns |
| Context7 | Get current docs for Next.js 15, Laravel 11, shadcn/ui, PowerSync |
| Memory MCP | Update OpenClaw entities after plan rewrite |
| GitHub MCP | Search for healthcare SaaS boilerplate repos, reference architectures |

## Agents to Delegate To

| Agent | When |
|-------|------|
| `feature-dev:code-architect` | Design the standalone SaaS architecture blueprint |
| `feature-dev:code-explorer` | Audit existing PHP codebase for portable business logic |
| `test-and-explain` | Validate architecture decisions |

## Research Approach
1. Search: "best tech stack healthcare SaaS 2026 solo developer"
2. Search: "Laravel vs Next.js healthcare application comparison"
3. Search: "healthcare SaaS boilerplate open source 2025 2026"
4. Check what Pabau, Dentally, Semble use (job postings, stackshare, GitHub)
5. Check Context7 for Next.js 15 App Router + Laravel 11 latest patterns

---

## Task 1: Research and decide SaaS tech stack
Use `/research-buddies` to determine: Laravel backend + Next.js frontend? Next.js full-stack? Something else? Consider: Bean is a non-coder, OpenClaw/Claude builds everything, quality > speed, needs FHIR, needs multi-tenancy, needs offline-first later, needs native mobile app later. Run `/gap-analysis` on output.

## Task 2: Design standalone SaaS architecture
Use `/software-architecture` + `feature-dev:code-architect` agent. Design Clean Architecture with: auth layer, patient data layer, appointment layer, prescription layer, lab layer, FHIR facade, Shifa Bot integration point, WP connector API. Run `/gap-analysis` on output.

## Task 3: Rewrite STRATEGIC-PLAN.md
Use `/strategic-plan`. Rewrite the 16-week plan for standalone SaaS. Reference what business logic to port from existing PHP codebase. Update ROADMAP.md and BUSINESS-MODEL.md. Run `/gap-analysis` on output.

## Task 4: Generate interactive brief + update OpenClaw
Use `/interactive-brief` on the rewritten plan. Save to A:/.openclaw/.interactive-briefs/. Delete or archive the outdated 2026-03-22-helpingdoctors-strategic-plan.html. Update Memory MCP entities.

## Task 5: Update project docs
Use `/claude-md-management:revise-claude-md` to update CLAUDE.md. Remove WP-plugin-first assumptions. Add standalone SaaS architecture section. Update DECISION-BRIEF.md to fix the KiviCare Flutter and language scope errors.

## Guardrails
- Do NOT build on top of the existing WordPress plugin. Mine it for business logic only.
- Bean's priorities: quality, reliability, sellability, UX. NOT speed.
- OpenClaw builds 24/7 — do not constrain plans to 15 hrs/week.
- Commercial first. No charity deployments without revenue or grant funding.
- Schema-per-tenant PostgreSQL. Not MySQL multisite prefix.
- 10+ languages from launch. Not just Arabic/English.
- Patient app = native (App Store/Play Store). Staff app = web is fine.
- Shifa Bot = FAQ + booking only. No clinical decisions (avoids MHRA SaMD).
~~~
