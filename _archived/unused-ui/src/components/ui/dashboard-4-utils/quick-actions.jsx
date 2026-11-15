import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { Button } from '../button'
import { Plus, Eye, ShieldCheck, Github } from 'lucide-react'

export function QuickActions({ onNewRoadmap, onSelectRoadmap, roadmaps }) {
  const latest = roadmaps?.[0]
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Jump back into building</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onNewRoadmap}>
          <Plus className="h-4 w-4" />
          Generate roadmap
        </Button>
        {latest && (
          <>
            <Button variant="outline" size="sm" onClick={() => onSelectRoadmap?.(latest)}>
              <Eye className="h-4 w-4" />
              Open latest
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSelectRoadmap?.(latest)}>
              <ShieldCheck className="h-4 w-4" />
              Verify latest
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={onNewRoadmap}>
          <Github className="h-4 w-4" />
          Connect repo
        </Button>
      </CardContent>
    </Card>
  )
}
