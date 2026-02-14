# Conversation Starter Template

**Copy and paste this at the START of every new Claude session.**

---

## Quick Restart (Simplest Option)

**If tracking files exist (LAUNCH-PLAN.md and CONVERSATION-HANDOFF.md), just say:**
```
Continue from CONVERSATION-HANDOFF.md
```

Claude will load full context and resume exactly where you left off.

---

## Full Starter (When Quick Restart Won't Work)

```
Read these files first (in order):
1. C:\Users\Bean\.claude\global-rules\ (all 10 files)
2. .claude/rules/ (all project rules)
3. docs/session-management/CURRENT-STATE.md
4. [Previous session handoff if applicable]

Key reminders for this project:
- UK English throughout (colour, organisation, behaviour, specialisations)
- SFTP deployment to Hostinger (NOT Local WP)
- Sole developer - no "team will handle it" assumptions
- After ANY file change: list file with full path, wait for upload confirmation
- Do NOT batch multiple files - one at a time

Constants that EXIST (don't assume missing):
- HD_ENCRYPTION_KEY, HD_TURNSTILE_SITE_KEY, HD_TURNSTILE_SECRET_KEY
- HD_TWILIO_SID, HD_TWILIO_TOKEN, HD_TWILIO_PHONE
- HD_WHO_ICD11_TOKEN

Database uses wp_X_hd_ prefix (multisite - X is blog ID).
Use UM roles, NOT WordPress roles.

---

Today's session:
- Task: [What we're working on]
- Continuation point: [Where we left off, or "Starting fresh"]
- Priority: [What's most important]
```

---

## Restart Scenarios

### Daily work session
```
Continue from CONVERSATION-HANDOFF.md
```

### Hit conversation limit
```
Continue from CONVERSATION-HANDOFF.md
```

### Major milestone completed
```
Continue from CONVERSATION-HANDOFF.md

Update LAUNCH-PLAN.md: [Phase/feature] complete. Show gap analysis and next priorities.
```

### Switching focus
```
Continue from CONVERSATION-HANDOFF.md

I need to pause [current work] and handle [urgent task]. Update priorities.
```

### Need status check only
```
Show current status from CONVERSATION-HANDOFF.md and next 3 priorities from LAUNCH-PLAN.md
```

### Focus on specific task
```
Continue from CONVERSATION-HANDOFF.md

Today I want to focus on [specific feature]. Does this align with current priorities, or should we finish [current task] first?
```

---

## Troubleshooting Restarts

### If Claude asks for context that's in files
**Say:**
```
The answer is in CONVERSATION-HANDOFF.md [or LAUNCH-PLAN.md or CURRENT-STATE.md]
```

### If tracking isn't happening automatically
**Say:**
```
Follow auto-tracking requirements from global rules. Update LAUNCH-PLAN.md and CONVERSATION-HANDOFF.md now.
```

### If unclear what to work on
**Say:**
```
Show next 3 priorities from LAUNCH-PLAN.md and recommend which to tackle first.
```

---

## Customise Before Pasting (Full Starter)

Replace these placeholders:
- `[Previous session handoff if applicable]` → Actual handoff file path, or remove line
- `[What we're working on]` → Specific task description
- `[Where we left off, or "Starting fresh"]` → Exact continuation point
- `[What's most important]` → Session priority

---

## Why This Exists

From documented friction points:
- Issue #3: Context lost between sessions
- Issue #1: Established patterns forgotten after compaction
- Issue #9: UK English not consistently applied

This starter template ensures Claude has critical context BEFORE starting any work.
