import { Card, CardContent, CardHeader, CardTitle } from '../card'
import { LayoutDashboard, ListOrdered, Layers, ShieldCheck } from 'lucide-react'

export function DashboardStats({ roadmaps, totalMilestones, avgMilestones }) {
  const metrics = [
    { label: 'Roadmaps', value: String(roadmaps?.length ?? 0), sub: 'saved to Firestore', icon: LayoutDashboard },
    { label: 'Total milestones', value: String(totalMilestones ?? 0), sub: 'across all roadmaps', icon: ListOrdered },
    { label: 'Avg depth', value: `${avgMilestones ?? 0} steps`, sub: 'milestones per roadmap', icon: Layers },
    { label: 'Verified', value: '—', sub: 'verify a repo to populate', icon: ShieldCheck },
  ]
  return (
    <>
      {metrics.map((m) => (
        <Card key={m.label} className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
            <m.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="truncate text-2xl font-bold tabular-nums" title={m.value}>{m.value}</div>
            <p className="truncate text-xs text-muted-foreground">{m.sub}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
