# Dashboard Widgets

**Project:** Medinova
**Count:** 53 widgets across 8 categories
**Stack:** React + shadcn/ui Cards + Tremor charts + drag-and-drop grid

---

## Widget Categories (53 total)

| # | Category | Count | Examples |
|---|---|---|---|
| 1 | Clinical | 12 | Today's Appointments, Patient Queue, Drug Interaction Warnings |
| 2 | Administrative | 8 | Staff Schedule, Room Availability, Check-in Queue |
| 3 | Analytics | 7 | Patient Flow Chart, Revenue Trends, Appointment Heatmap |
| 4 | Patient Care | 6 | Care Plan Status, Medication Adherence, Immunisation Schedule |
| 5 | Communication | 5 | Message Centre, Team Chat, Patient Messages |
| 6 | Humanitarian | 5 | Mass Casualty Status, Outbreak Tracker, Vaccination Campaign |
| 7 | System | 5 | System Health, Sync Status, Audit Activity |
| 8 | Quick Actions | 5 | New Patient, New Appointment, Quick Prescription |

---

## Widget Component Interface

```typescript
// packages/ui/src/widgets/types.ts
export interface WidgetDefinition {
  id: string;                          // 'clinical.todays-appointments'
  title: string;                       // i18n key
  category: WidgetCategory;
  roles: MedicalRole[];                // Which roles see this widget
  minW: number;                        // Minimum grid columns (1-12)
  minH: number;                        // Minimum grid rows
  defaultW: number;                    // Default width
  defaultH: number;                    // Default height
  refreshInterval?: number;            // Seconds (0 = no auto-refresh)
}

export interface WidgetProps {
  definition: WidgetDefinition;
  tenantId: string;
}
```

---

## Widget Implementation Pattern

```tsx
// Each widget is a Client Component using React Query for data
'use client';
export function TodaysAppointmentsWidget({ definition, tenantId }: WidgetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['widget', definition.id, tenantId],
    queryFn: () => client.appointments.today.query(),
    refetchInterval: (definition.refreshInterval ?? 60) * 1000,
  });

  if (isLoading) return <WidgetSkeleton definition={definition} />;

  return (
    <Card>
      <CardHeader><CardTitle>{t(definition.title)}</CardTitle></CardHeader>
      <CardContent>
        {/* Widget-specific content */}
      </CardContent>
    </Card>
  );
}
```

For analytics widgets, use **Tremor** components (BarChart, AreaChart, DonutChart, KPI cards).

---

## Dashboard Grid — Drag and Drop

```tsx
// apps/web/src/app/(dashboard)/page.tsx
'use client';
export function DashboardGrid({ userRole, savedLayout }: DashboardGridProps) {
  const [layout, setLayout] = useState<LayoutItem[]>(
    savedLayout ?? getDefaultLayout(userRole)
  );

  const handleLayoutChange = useDebouncedCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    client.userPreferences.saveLayout.mutate({ body: { layout: newLayout } });
  }, 500);

  return (
    <ResponsiveGridLayout
      layouts={{ lg: layout }}
      cols={{ lg: 12, md: 8, sm: 4, xs: 2 }}
      rowHeight={80}
      isDraggable
      isResizable
      draggableHandle=".widget-drag-handle"
      onLayoutChange={handleLayoutChange}
    >
      {layout.map((item) => (
        <div key={item.i}>
          <WidgetRenderer widgetId={item.i} tenantId={tenantId} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
```

Use `react-grid-layout` for the drag-and-drop grid. Responsive breakpoints: 12/8/4/2 columns.

---

## Layout Persistence

Layouts are saved per user via the API:

```typescript
// POST /api/user-preferences/layout
// Body: { layout: LayoutItem[] }
// Stored in public.user_preferences table (JSONB column)
```

---

## Role Default Layouts

| Role Group | Default Widgets |
|---|---|
| Physician Core | All Clinical, Patient Care, Analytics |
| Nursing | Clinical (selected), Patient Care, Tasks |
| Front Desk | Administrative, Check-in Queue, Schedule |
| Clinic Management | Analytics, Administrative, System |
| Humanitarian | Humanitarian, Clinical, Quick Actions |

---

## Customiser Panel — REQUIRED

Users MUST be able to:
- **Drag** widgets to reposition
- **Resize** widgets within min/max bounds
- **Show/hide** widgets via a customiser drawer
- **Reset** to role default layout

---

## Checklist

- [ ] Widget uses WidgetProps interface?
- [ ] Data fetched via React Query with refresh interval?
- [ ] Analytics widgets use Tremor charts?
- [ ] Grid layout responsive (12/8/4/2 columns)?
- [ ] Layout persists via API on change?
- [ ] Role-based default layout provided?
- [ ] Customiser drawer for show/hide?
