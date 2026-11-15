import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

export function StackSplitChart({ data }) {
  const rows = data?.length > 0 ? data : [{ stack: 'No data yet', count: 0 }]
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Stack split</CardTitle>
        <CardDescription>Roadmaps by primary tech stack</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ count: { label: 'Roadmaps', color: '#a1a1aa' } }}>
          <BarChart data={rows}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="stack" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
