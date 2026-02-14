# Shafi AI Chatbot

**Project:** HelpingDoctors EHR Pro
**Status:** ~70% complete (JS incomplete)
**Technology:** Cloudflare AI Workers

---

## Overview

Shafi (شافي - "healer" in Arabic) is the AI chatbot assistant for:
- Patient scheduling help
- Symptom pre-screening
- FAQ responses
- Appointment reminders
- Multilingual support (English/Arabic)

---

## Architecture

```
User Interface (Frontend)
    ↓
Shafi Widget (JavaScript)
    ↓
Cloudflare AI Worker
    ↓
Claude/LLM API
    ↓
Response with context
```

---

## Current Status

### ✅ Completed
- Backend Cloudflare Worker
- Basic prompt engineering
- Language detection
- Context injection

### ⚠️ Incomplete
- JavaScript widget
- Language switcher UI
- Mobile responsiveness
- Offline message queue

---

## Implementation Notes

### Language Switcher Issue
From Shafi conversation:
> ChatGPT identified that the language switcher needed better UX. The toggle should persist user preference and work with RTL layout for Arabic.

### Key Requirements
1. **Bilingual** - English and Arabic
2. **RTL Support** - Arabic text right-to-left
3. **Context-Aware** - Knows user role and clinic
4. **Safe** - No medical diagnosis, redirect to professionals
5. **Offline Queue** - Store messages when offline

---

## Widget Structure

```javascript
class ShafiChatbot {
    constructor(options) {
        this.language = options.language || 'en';
        this.userId = options.userId;
        this.clinicId = options.clinicId;
        this.isOpen = false;
        this.messageQueue = [];
    }
    
    async sendMessage(message) {
        if (!navigator.onLine) {
            this.queueMessage(message);
            return { offline: true };
        }
        
        const response = await fetch('/api/shafi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Language': this.language
            },
            body: JSON.stringify({
                message,
                context: this.getContext()
            })
        });
        
        return response.json();
    }
}
```

---

## Safety Constraints

Shafi must NEVER:
- Diagnose medical conditions
- Recommend specific medications
- Replace professional medical advice
- Handle emergencies (redirect to 999/emergency)

Standard responses for medical queries:
> "I can help you schedule an appointment with a doctor who can properly assess your symptoms. Would you like me to find available times?"

---

## Checklist for Completion

- [ ] JavaScript widget complete?
- [ ] Language switcher working?
- [ ] RTL Arabic support?
- [ ] Offline message queue?
- [ ] Safety responses implemented?
