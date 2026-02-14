# Offline-First Architecture

**Project:** HelpingDoctors EHR Pro
**Context:** Humanitarian deployments, Gaza clinics, unreliable connectivity

---

## Core Principle

System MUST work offline. Gaza clinics operate with intermittent 2G/3G connectivity. Every feature must degrade gracefully when offline.

---

## Strategy

```
Online Mode
    ↓ (network loss)
Offline Mode (Service Worker + IndexedDB)
    ↓ (network restored)
Sync Mode (Queue processing)
    ↓ (complete)
Online Mode
```

---

## Service Worker

```javascript
// sw.js - Cache critical assets
const CACHE_NAME = 'hd-ehr-v1';
const CRITICAL_ASSETS = [
    '/',
    '/staff-dashboard/',
    '/patients/',
    '/appointments/',
    '/assets/css/main.css',
    '/assets/js/app.js',
    '/assets/js/offline.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CRITICAL_ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match('/offline.html'))
    );
});
```

---

## IndexedDB Storage

```javascript
// Local database schema
const DB_SCHEMA = {
    patients: {
        keyPath: 'id',
        indexes: ['name', 'mrn', 'updated_at']
    },
    appointments: {
        keyPath: 'id',
        indexes: ['patient_id', 'date', 'status']
    },
    prescriptions: {
        keyPath: 'id',
        indexes: ['patient_id', 'created_at']
    },
    sync_queue: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: ['action', 'status', 'created_at']
    }
};
```

---

## Sync Queue

All offline changes go to sync queue:

```javascript
// Queue an action for sync
async function queueForSync(action, data) {
    const db = await openDatabase();
    await db.add('sync_queue', {
        action: action,          // 'create_patient', 'update_appointment'
        data: data,
        status: 'pending',
        created_at: new Date().toISOString(),
        retry_count: 0
    });
}

// Process queue when online
async function processQueue() {
    if (!navigator.onLine) return;
    
    const db = await openDatabase();
    const pending = await db.getAll('sync_queue', 'pending');
    
    for (const item of pending) {
        try {
            await sendToServer(item);
            await db.delete('sync_queue', item.id);
        } catch (error) {
            item.retry_count++;
            item.status = item.retry_count > 3 ? 'failed' : 'pending';
            await db.put('sync_queue', item);
        }
    }
}
```

---

## UI Indicators

Always show connectivity status:

```html
<div id="connectivity-status" class="connectivity-banner">
    <span class="status-icon"></span>
    <span class="status-text"></span>
</div>
```

```javascript
// Update UI based on connectivity
function updateConnectivityUI() {
    const banner = document.getElementById('connectivity-status');
    const pendingCount = await getPendingQueueCount();
    
    if (navigator.onLine) {
        if (pendingCount > 0) {
            banner.className = 'connectivity-banner syncing';
            banner.querySelector('.status-text').textContent = 
                `Syncing ${pendingCount} changes...`;
        } else {
            banner.className = 'connectivity-banner online';
            banner.querySelector('.status-text').textContent = 'Online';
        }
    } else {
        banner.className = 'connectivity-banner offline';
        banner.querySelector('.status-text').textContent = 
            'Offline - Changes will sync when connected';
    }
}
```

---

## Critical for Humanitarian Use

- **Paper record OCR** - 5000+ paper records need digitising
- **Arabic language** - 80% of patients speak Arabic
- **Low bandwidth** - Optimise for 2G/3G
- **Battery saving** - Efficient sync scheduling
- **Conflict resolution** - Handle sync conflicts gracefully

---

## Checklist

- [ ] Service worker caches critical assets?
- [ ] IndexedDB stores offline data?
- [ ] Sync queue handles offline changes?
- [ ] UI shows connectivity status?
- [ ] Graceful degradation when offline?
