# Frontend Architecture — Next.js 15

**Project:** Medinova
**Stack:** Next.js 15 App Router + shadcn/ui + Tremor + ts-rest
**Principle:** Everything happens in the Next.js app. No separate admin panel.

---

## App Router Structure

```
apps/web/src/app/
├── (auth)/                    # Public auth pages (no sidebar)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── layout.tsx             # Centred card layout
├── (dashboard)/               # Authenticated app (sidebar + header)
│   ├── layout.tsx             # Sidebar, header, role context
│   ├── page.tsx               # Dashboard home (widgets)
│   ├── patients/
│   │   ├── page.tsx           # Patient list (Server Component)
│   │   ├── [id]/page.tsx      # Patient detail
│   │   └── new/page.tsx       # Create patient
│   ├── appointments/
│   ├── encounters/
│   ├── prescriptions/
│   ├── communications/
│   ├── reports/
│   └── settings/
├── api/                       # Next.js API routes (BFF proxy only)
└── layout.tsx                 # Root: providers, fonts, i18n
```

---

## Server vs Client Components

**Default to Server Components.** Only use `'use client'` when you need:

| Use Server Component | Use Client Component (`'use client'`) |
|---|---|
| Data fetching, list pages | Forms, interactive inputs |
| Static content, layouts | Drag-and-drop, modals, toasts |
| Metadata, SEO | Real-time updates (WebSocket) |
| Role-based content filtering | Client-side state (useState, useReducer) |

```tsx
// Server Component — fetches data, no interactivity
export default async function PatientsPage() {
  const patients = await api.patients.list.query({ query: { page: 1 } });
  return <PatientTable data={patients.body.data} />;
}

// Client Component — interactive table with sorting/filtering
'use client';
export function PatientTable({ data }: { data: Patient[] }) {
  const [sortBy, setSortBy] = useState<keyof Patient>('lastName');
  return ( /* shadcn DataTable */ );
}
```

---

## Route Protection — Middleware

```typescript
// apps/web/src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const path = request.nextUrl.pathname;

  // Public routes — no auth needed
  if (path.startsWith('/(auth)') || path === '/') return NextResponse.next();

  // No token — redirect to login
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  // Decode JWT, check role against route permissions
  const payload = decodeJwt(token);
  if (!hasRouteAccess(payload.role, path)) {
    return NextResponse.redirect(new URL('/unauthorised', request.url));
  }

  return NextResponse.next();
}
```

---

## API Calls — ts-rest Client

```typescript
// All API calls go through the shared ts-rest contract
import { client } from '@medinova/contracts';

// Server Component — direct call
const response = await client.patients.getById({ params: { id } });

// Client Component — via React Query
const { data, isLoading } = useQuery({
  queryKey: ['patient', id],
  queryFn: () => client.patients.getById({ params: { id } }),
});
```

Never use raw `fetch()` to the API. Always use the ts-rest client so types are shared.

---

## Component Library

- **shadcn/ui** — all form controls, tables, dialogs, cards, navigation
- **Tremor** — charts, KPIs, analytics dashboards
- **next-intl** — all user-facing strings (10+ languages from day 1)

```tsx
// All text via translation keys, never hardcoded
import { useTranslations } from 'next-intl';
const t = useTranslations('patients');
return <h1>{t('title')}</h1>; // "Patients" / "المرضى" / etc.
```

---

## Checklist

- [ ] Page is a Server Component unless interactivity requires client?
- [ ] Route protected via middleware role check?
- [ ] API calls use ts-rest client (not raw fetch)?
- [ ] All user-facing strings use next-intl translation keys?
- [ ] Using shadcn/ui components (not custom HTML)?
- [ ] Mobile-first responsive (44px touch targets)?
