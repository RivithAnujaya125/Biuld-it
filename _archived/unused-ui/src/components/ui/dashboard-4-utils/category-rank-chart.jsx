import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Badge } from '../badge'

export function MilestoneDepthChart({ data }) {
  const rows = data?.length > 0 ? data : [{ title: 'No roadmaps yet', milestones: 0 }]
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Milestone depth</CardTitle>
        <CardDescription>Milestones per roadmap</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ milestones: { label: 'Milestones', color: '#00f0ff' } }}>
          <BarChart data={rows} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="title" type="category" tickLine={false} axisLine={false} width={120} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="milestones" fill="var(--color-milestones)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rows.slice(0, 5).map((r) => (
            <Badge key={r.title} variant="secondary">
              {r.title} · {r.milestones}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
