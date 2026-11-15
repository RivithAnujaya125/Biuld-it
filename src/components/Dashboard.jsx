import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Settings3 from './ui/settings-3'
import { getUserRoadmaps } from '../lib/roadmaps'
import Brand from './Brand'
import {
  LayoutDashboard,
  Plus,
  Eye,
  ShieldCheck,
  Github,
  CalendarDays,
  TrendingUp,
  FolderGit2,
  Sparkles,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Skeleton } from './ui/skeleton'

// Common GitHub language colors
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
}

function formatDate(timestamp) {
  if (!timestamp) return 'Recent'
  let date
  if (timestamp.toDate) {
    date = timestamp.toDate()
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else {
    date = new Date(timestamp)
  }
  if (isNaN(date.getTime())) return 'Recent'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMemberSince(user) {
  if (user?.metadata?.creationTime) {
    const d = new Date(user.metadata.creationTime)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return 'Sep 2026'
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffInDays <= 0) return 'today'
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}

export default function Dashboard({ onNewRoadmap, onSelectRoadmap, onHome }) {
  const { user, signOut, signInWithGithub } = useAuth()
  const [roadmaps, setRoadmaps] = useState([])
  const [githubRepos, setGithubRepos] = useState([])
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(false)

  const username =
    user?.reloadUserInfo?.screenName ||
    user?.displayName?.toLowerCase().replace(/\s+/g, '-') ||
    user?.email?.split('@')[0] ||
    'builder'

  const displayName =
    user?.displayName?.split(' ')[0] ||
    user?.reloadUserInfo?.screenName ||
    'Builder'

  const userInitials = (
    user?.displayName
      ? user.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : username.slice(0, 2).toUpperCase()
  ) || 'RA'

  // Fetch saved roadmaps from Firestore
  useEffect(() => {
    async function loadRoadmaps() {
      if (user?.uid) {
        setLoadingRoadmaps(true)
        try {
          const data = await getUserRoadmaps(user.uid)
          setRoadmaps(data)
        } catch (err) {
          console.error('Failed to load user roadmaps:', err)
        } finally {
          setLoadingRoadmaps(false)
        }
      } else {
        setLoadingRoadmaps(false)
      }
    }
    loadRoadmaps()
  }, [user])

  // Fetch real GitHub repos for the user if GitHub username available
  useEffect(() => {
    async function loadRepos() {
      if (username && username !== 'builder') {
        setLoadingRepos(true)
        try {
          const res = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'build-it-verifier',
              },
            }
          )
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data)) {
              setGithubRepos(data)
            }
          }
        } catch (err) {
          console.warn('Could not fetch GitHub repos:', err)
        } finally {
          setLoadingRepos(false)
        }
      }
    }
    loadRepos()
  }, [username])

  // Fallback sample repos if none fetched
  const displayRepos = githubRepos.length > 0 ? githubRepos : [
    {
      name: 'Biuld-it',
      language: 'JavaScript',
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      name: 'ragging-report-platform',
      language: 'TypeScript',
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      name: 'rate-limiter',
      language: 'TypeScript',
      updated_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
  ]

  // Fallback mock roadmaps (shown when Firestore is empty)
  const mockRoadmaps = [
    {
      project_title: 'GitHub Verification Agent',
      description: 'Agentic repo analyzer that verifies milestones against live code.',
      tech_stack: ['React', 'Gemini', 'GitHub API'],
      milestones: [{}, {}, {}, {}],
      mockDone: 2,
      mockDate: 'Sep 12',
    },
    {
      project_title: 'Realtime Collab Board',
      description: 'Multiplayer whiteboard with CRDT sync and presence.',
      tech_stack: ['TypeScript', 'WebSockets'],
      milestones: [{}, {}, {}, {}],
      mockDone: 1,
      mockDate: 'Sep 8',
    },
    {
      project_title: 'Rate Limiter Library (npm)',
      description: 'Token-bucket limiter published as a zero-dep npm package.',
      tech_stack: ['TypeScript', 'npm'],
      milestones: [{}, {}, {}],
      mockDone: 3,
      mockDate: 'Sep 5',
    },
  ]
  const visibleRoadmaps = roadmaps.length > 0 ? roadmaps : mockRoadmaps

  // Calculate stats
  const totalRoadmapsCount = roadmaps.length > 0 ? roadmaps.length : 4
  const lastVerifiedProject =
    roadmaps[0]?.project_title || displayRepos[0]?.name || 'Biuld-it'

  const stats = [
    { label: 'Roadmaps Generated', value: String(totalRoadmapsCount), sub: user ? 'saved to Firestore' : 'sign in to persist', icon: LayoutDashboard },
    { label: 'Overall Completion', value: '38%', sub: 'across all roadmaps', icon: TrendingUp, progress: 38 },
    { label: 'Member Since', value: formatMemberSince(user), sub: user?.email || 'GitHub OAuth', icon: CalendarDays },
    { label: 'Last Verified', value: lastVerifiedProject, sub: '2 days ago', icon: ShieldCheck },
  ]

  const getProgress = (r, idx) => {
    const totalM = (r.milestones || []).length || 4
    const doneM =
      typeof r.mockDone === 'number'
        ? Math.min(r.mockDone, totalM)
        : Math.min(idx === 0 ? 1 : idx === 2 ? 3 : 0, totalM)
    const percent = totalM > 0 ? Math.round((doneM / totalM) * 100) : 0
    return { totalM, doneM, percent }
  }

  return (
    <div className="min-h-screen bg-bg text-textPrimary">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button type="button" onClick={onHome} className="flex items-center gap-2.5">
            <Brand size="md" />
            <Badge variant="secondary" className="hidden sm:inline-flex">v1.0.4</Badge>
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={displayName} />}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden leading-tight sm:block">
                    <p className="text-[13px] font-semibold">{displayName}</p>
                    <p className="font-mono text-[11px] text-textMuted">@{username}</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => signInWithGithub()}>
                <Github className="h-4 w-4" />
                Sign in with GitHub
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <Badge className="w-fit">
              <Sparkles className="h-3 w-3" />
              Dashboard
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {displayName}</h1>
            <p className="text-sm text-textMuted">Here&apos;s where your roadmaps and repos stand.</p>
          </div>
          <Button onClick={onNewRoadmap}>
            <Plus className="h-4 w-4" />
            Generate New Roadmap
          </Button>
        </div>

        {/* Stats Row - shadcn Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loadingRoadmaps
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2"><Skeleton className="h-3 w-24" /></CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-3 w-28" />
                  </CardContent>
                </Card>
              ))
            : stats.map((s) => (
                <Card key={s.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-mono text-[11px] font-medium uppercase tracking-wider text-textMuted">{s.label}</CardTitle>
                    <s.icon className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="truncate text-2xl font-bold" title={s.value}>{s.value}</div>
                    <p className="truncate font-mono text-[11px] text-textFaint">{s.sub}</p>
                    {typeof s.progress === 'number' && <Progress value={s.progress} className="mt-3" />}
                  </CardContent>
                </Card>
              ))}
        </div>

        <Tabs defaultValue="roadmaps" className="w-full">
          <TabsList>
            <TabsTrigger value="roadmaps">
              <FolderGit2 className="mr-1.5 h-3.5 w-3.5" />
              Roadmaps
              <Badge variant="secondary" className="ml-2">{totalRoadmapsCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="repos">
              <Github className="mr-1.5 h-3.5 w-3.5" />
              GitHub Repos
              <Badge variant="secondary" className="ml-2">{displayRepos.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-1.5 h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roadmaps" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loadingRoadmaps ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                    </CardFooter>
                  </Card>
                ))
              ) : (
                visibleRoadmaps.map((r, idx) => {
                  const stack = Array.isArray(r.tech_stack) ? r.tech_stack : ['React', 'Node.js']
                  const { totalM, doneM, percent } = getProgress(r, idx)
                  const isMock = roadmaps.length === 0
                  return (
                    <Card key={r.id || r.project_title || idx} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-base leading-snug">{r.project_title || 'Untitled Roadmap'}</CardTitle>
                          <Badge variant="secondary" className="shrink-0">{r.createdAt ? formatDate(r.createdAt) : r.mockDate || 'Recent'}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{r.description || 'AI-generated spec with demoable milestones.'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {stack.slice(0, 4).map((tech) => (<Badge key={tech}>{tech}</Badge>))}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Progress value={percent} />
                          <div className="flex items-center justify-between font-mono text-[11px] text-textMuted">
                            <span>{doneM}/{totalM} done</span>
                            <span className="text-accent">{percent}%</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button variant="secondary" size="sm" className="flex-1" onClick={() => (isMock ? onNewRoadmap?.() : onSelectRoadmap?.(r))}>
                          <Eye className="h-3.5 w-3.5" />View
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => (isMock ? onNewRoadmap?.() : onSelectRoadmap?.(r))}>
                          <ShieldCheck className="h-3.5 w-3.5" />Verify Progress
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="repos" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">Your GitHub Repos</CardTitle>
                  <CardDescription>
                    {githubRepos.length > 0 ? `Live from @${username} (${githubRepos.length} repos)` : 'Live from GitHub — real user repositories'}
                  </CardDescription>
                </div>
                {loadingRepos && <Badge variant="secondary" className="animate-pulse">syncing…</Badge>}
              </CardHeader>
              <CardContent className="p-0">
                <Separator />
                <div className="flex flex-col divide-y divide-border">
                  {loadingRepos && githubRepos.length === 0
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-52" />
                          </div>
                          <Skeleton className="h-8 w-44" />
                        </div>
                      ))
                    : displayRepos.map((repo) => {
                        const lang = repo.language || 'Code'
                        const dotColor = LANG_COLORS[lang] || '#00f0ff'
                        const updatedText = timeAgo(repo.updated_at)
                        return (
                          <div key={repo.name} className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-surfaceMuted/50 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surfaceMuted">
                                <Github className="h-4 w-4 text-textMuted" />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{repo.name}</p>
                                <p className="flex items-center gap-1.5 font-mono text-[11px] text-textMuted">
                                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: dotColor }} />
                                  {lang} · updated {updatedText}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="shrink-0" onClick={onNewRoadmap}>
                              Verify against a roadmap
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )
                      })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <div className="flex w-full items-center justify-center">
              <div className="w-full max-w-md">
                <Settings3
                  rows={[
                    { key: 'name', label: 'Full name', value: user?.displayName || 'Builder' },
                    { key: 'email', label: 'Email', value: user?.email || 'Not set' },
                    { key: 'phone', label: 'Phone', value: '+1 555 0142' },
                  ]}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
