# Offline-First Architecture

**Project:** Medinova
**Context:** Humanitarian deployments (Gaza), unreliable 2G/3G connectivity
**Stack:** Next.js 15 PWA (Serwist) + idb + TypeScript

---

## Strategy

```
Online Mode
    -> (network loss)
Offline Mode (Service Worker + IndexedDB)
    -> (network restored)
Sync Mode (queue processing)
    -> (complete)
Online Mode
```

---

## PWA Setup — Serwist (next-pwa successor)

```typescript
// apps/web/next.config.ts
import withSerwist from '@serwist/next';

export default withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  revalidates: '/api/',
})(nextConfig);
```

```typescript
// apps/web/src/sw.ts — service worker entry
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: defaultCache,
  skipWaiting: true,
  clientsClaim: true,
});

serwist.addEventListeners();
```

---

## IndexedDB — Offline Data Store (idb)

```typescript
// packages/ui/src/lib/offline-db.ts
import { openDB, type DBSchema } from 'idb';

interface MedinovaOfflineDB extends DBSchema {
  patients: { key: string; value: PatientSummary; indexes: { mrn: string } };
  appointments: { key: string; value: AppointmentSummary; indexes: { date: string } };
  syncQueue: { key: number; value: SyncQueueItem; indexes: { status: string } };
}

export async function getOfflineDB() {
  return openDB<MedinovaOfflineDB>('medinova-offline', 1, {
    upgrade(db) {
      const patients = db.createObjectStore('patients', { keyPath: 'id' });
      patients.createIndex('mrn', 'mrn', { unique: true });

      const appointments = db.createObjectStore('appointments', { keyPath: 'id' });
      appointments.createIndex('date', 'date');

      const queue = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      queue.createIndex('status', 'status');
    },
  });
}
```

---

## Sync Queue — Offline Mutations

```typescript
// packages/ui/src/lib/sync-queue.ts
interface SyncQueueItem {
  id?: number;
  action: string;          // 'create_patient', 'update_appointment'
  endpoint: string;        // ts-rest route key
  payload: unknown;
  status: 'pending' | 'failed';
  createdAt: string;
  retryCount: number;
}

export async function queueMutation(action: string, endpoint: string, payload: unknown) {
  const db = await getOfflineDB();
  await db.add('syncQueue', {
    action, endpoint, payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
}

export async function processQueue() {
  if (!navigator.onLine) return;
  const db = await getOfflineDB();
  const pending = await db.getAllFromIndex('syncQueue', 'status', 'pending');

  for (const item of pending) {
    try {
      await sendToServer(item);
      await db.delete('syncQueue', item.id!);
    } catch {
      item.retryCount++;
      item.status = item.retryCount > 3 ? 'failed' : 'pending';
      await db.put('syncQueue', item);
    }
  }
}
```

---

## useNetworkStatus Hook

```typescript
// packages/ui/src/hooks/use-network-status.ts
'use client';
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); processQueue(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  return { isOnline, pendingCount, isSyncing: isOnline && pendingCount > 0 };
}
```

Use `<ConnectivityBanner />` in the dashboard layout to show online/offline/syncing state.

---

## Humanitarian Constraints

- **Low bandwidth** — compress all assets, lazy-load images, cache aggressively
- **Battery saving** — batch sync, debounce writes, avoid polling
- **10+ languages** — cache translation bundles in service worker
- **Conflict resolution** — last-write-wins with server timestamp; flag conflicts for manual review
- **OCR queue** — paper record scans stored locally, uploaded when online

---

## Checklist

- [ ] Serwist configured for asset precaching?
- [ ] IndexedDB schema covers all offline-needed entities?
- [ ] Mutations queued when offline (not dropped)?
- [ ] processQueue() runs on reconnect?
- [ ] ConnectivityBanner visible in dashboard layout?
- [ ] Graceful degradation — read works offline, writes queued?
