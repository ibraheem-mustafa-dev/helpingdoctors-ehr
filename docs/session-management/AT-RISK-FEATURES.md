# At-Risk Features

**Source:** FEATURE-STATUS-MATRIX.md (21 conversation analysis)
**Purpose:** Prevent these items from being forgotten
**Status:** ⚠️ REQUIRES ATTENTION

---

## Why This File Exists

From Conversation 4:
> "They're not going to be addressed if you don't add them to Phase 1 section as this probably won't get checked after we move on"

These features were discussed, sometimes even partially implemented, but are at risk of being forgotten due to:
- Token limit interruptions
- No handoff mechanism
- Documentation but no scheduling
- Analysis complete but no implementation

---

## ⚠️ At-Risk Item 1: Phase B Staff Profiles

**First Mentioned:** Conversation 4
**Status:** Discussed but NEVER moved to Phase 1
**Risk Level:** HIGH

### What Was Promised
- Staff profile photos
- Biography/about section
- Languages spoken
- Working hours display

### What Happened
User explicitly requested:
> "Move them to Phase 1 specifications"

Conversation hit token limit BEFORE this was done.

### Current State
- Documented as "future feature"
- NOT scheduled in any phase
- Will be forgotten without action

### Action Required
```
Add to Phase 1 specifications:
- task-1_9-staff-profile-enhancement.md should include:
  - Photo upload and display
  - Biography text field
  - Languages multiselect
  - Working hours widget
```

---

## ⚠️ At-Risk Item 2: Shafi Chatbot JavaScript

**First Mentioned:** Shafi conversations
**Status:** ~70% complete, interrupted
**Risk Level:** HIGH

### What Was Promised
Complete JavaScript implementation for:
- Chat widget UI
- Language switcher (English/Arabic)
- RTL support for Arabic
- Offline message queue
- Mobile responsiveness

### What Happened
- Backend Cloudflare Worker: ✅ Complete
- JavaScript widget: ❌ Interrupted at 70%
- Language switcher: ❌ ChatGPT had to fix issues
- No handoff document created

### Current State
- Partial JS exists but incomplete
- Language switcher has UX issues (ChatGPT identified)
- Not integrated into main app
- No continuation point documented

### Action Required
```
1. Locate existing Shafi JS file
2. Document what's complete vs incomplete
3. Create task file: task-shafi-completion.md
4. Include ChatGPT's language switcher fixes
5. Add to Phase 1 or Phase 2 schedule
```

---

## ⚠️ At-Risk Item 3: Database Auto-Creation Fix

**First Mentioned:** Conversation 3
**Status:** Workaround applied, root cause not fixed
**Risk Level:** MEDIUM

### What Was Promised
Database tables should auto-create on plugin activation.

### What Happened
- Tables didn't create automatically
- User had to manually add via phpMyAdmin
- Root cause never identified/fixed

### Current State
- Tables exist (manually created)
- Future installations will have same problem
- Activation hook may be broken or missing

### Action Required
```
1. Audit register_activation_hook() in main plugin file
2. Verify dbDelta() is called correctly
3. Test fresh installation creates all 70+ tables
4. Add to deployment checklist
```

---

## ⚠️ At-Risk Item 4: Page Creation Button Fix

**First Mentioned:** EHR Page Creation conversation
**Status:** Analysis complete, NO implementation
**Risk Level:** MEDIUM

### What Was Promised
Fix the broken "Create Page" button in Staff Dashboard.

### What Happened
- User provided screenshot of broken button
- Analysis identified 2 missing shortcodes
- User demanded "real research" and 2025 standards
- Better analysis was done
- Implementation NEVER happened

### Current State
- Root cause identified
- Fix documented
- Code never written
- Button still broken

### Action Required
```
1. Implement the fix identified in analysis
2. Test page creation button works
3. Verify all shortcodes are registered
4. Add regression test
```

---

## Additional Monitoring Items

These aren't "at risk" but need watching:

| Feature | Status | Why Monitor |
|---------|--------|-------------|
| Performance Optimiser | Fixed | Broke admin before; could regress |
| Clinic Locations | Review needed | User flagged "may not meet current standards" |
| UK English Compliance | Partial | Inconsistently applied; easy to slip |
| ADHD Workflow Support | Partial | Claude sometimes skips file lists |

---

## Prevention Strategies

### For Token Limit Interruptions
1. Create handoff document BEFORE hitting limit
2. At 70% context, stop and create checkpoint
3. Explicit continuation points with file paths

### For "Discussed But Not Scheduled"
1. If user says "add to Phase X", DO IT immediately
2. Don't just acknowledge - update the actual file
3. Confirm the update was made

### For "Analysis But No Implementation"
1. Analysis should end with "Shall I implement?"
2. If yes, complete the implementation
3. If interrupted, create explicit continuation task

---

## Checklist for Next Session

- [ ] Phase B Staff Profiles: Added to Phase 1 spec?
- [ ] Shafi JavaScript: Continuation task created?
- [ ] Database auto-creation: Activation hook audited?
- [ ] Page creation button: Fix implemented?
- [ ] Performance optimiser: Still working correctly?

---

*This file should be checked at the START of every session to prevent forgotten features.*
