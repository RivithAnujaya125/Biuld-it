import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

export function VelocityChart({ data }) {
  const points = data?.length > 0 ? data : [
    { label: 'W1', roadmaps: 0 },
    { label: 'W2', roadmaps: 0 },
    { label: 'W3', roadmaps: 0 },
    { label: 'W4', roadmaps: 0 },
  ]
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Roadmap velocity</CardTitle>
        <CardDescription>Roadmaps created per week — last 6 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ roadmaps: { label: 'Roadmaps', color: '#00f0ff' } }}>
          <AreaChart data={points}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey="roadmaps" fill="var(--color-roadmaps)" stroke="var(--color-roadmaps)" fillOpacity={0.25} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
