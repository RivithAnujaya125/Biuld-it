import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserRoadmaps } from '../lib/roadmaps'
import AppShell from './AppShell'
import { LayoutDashboard, ArrowLeft, Github, LogOut, CheckCircle2 } from 'lucide-react'

export default function DashboardPlaceholder({ onBack }) {
  const { user, signInWithGithub, signOut } = useAuth()
  const [roadmaps, setRoadmaps] = useState([])
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    async function fetchRoadmaps() {
      if (user?.uid) {
        setLoadingRoadmaps(true)
        setFetchError(null)
        try {
          const data = await getUserRoadmaps(user.uid)
          console.log('[Dashboard] Fetched saved roadmaps for user', user.uid, ':', data)
          setRoadmaps(data)
        } catch (err) {
          console.error('[Dashboard] Error fetching saved roadmaps:', err)
          setFetchError(err.message)
        } finally {
          setLoadingRoadmaps(false)
        }
      } else {
        console.log('[Dashboard] No user signed in on dashboard view')
        setRoadmaps([])
      }
    }

    fetchRoadmaps()
  }, [user])

  return (
    <AppShell statusLabel="Dashboard Scaffolding Active" subLabel="Roadmaps Scaffolding / Figma Placeholder">
      <div className="bg-surface border border-border rounded-lg p-10 w-[760px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl text-textPrimary">Student Dashboard</h1>
              <p className="text-textMuted text-xs">
                Scaffolding for saved roadmaps (inspect browser console for data)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 bg-border hover:bg-border/80 text-textPrimary px-3 py-2 rounded-md text-xs font-mono transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Generator</span>
          </button>
        </div>

        {/* Auth status bar */}
        <div className="bg-surfaceMuted border border-border rounded-md p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Github size={18} className="text-textMuted" />
            {user ? (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-textPrimary">
                  {user.displayName || user.email || 'Authenticated User'}
                </span>
                <span className="text-[11px] font-mono text-textFaint">
                  UID: {user.uid}
                </span>
              </div>
            ) : (
              <span className="text-xs text-textMuted">Not currently signed in</span>
            )}
          </div>

          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-1.5 border border-border hover:border-red-500/50 text-textMuted hover:text-red-400 px-3 py-1.5 rounded text-xs font-mono transition-colors"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGithub}
              className="flex items-center gap-1.5 bg-accent text-bg hover:bg-accent/90 px-3 py-1.5 rounded text-xs font-bold transition-colors"
            >
              <Github size={14} />
              <span>Sign In with GitHub</span>
            </button>
          )}
        </div>

        {/* Roadmaps fetched status */}
        <div className="border border-border/80 rounded-md p-5 flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between text-textMuted border-b border-border/50 pb-2">
            <span>SAVED ROADMAPS STATUS</span>
            <span className="text-accent">{roadmaps.length} RECORD(S)</span>
          </div>

          {loadingRoadmaps && (
            <p className="text-accent py-2 animate-pulse">&gt; Fetching roadmaps from Firestore...</p>
          )}

          {fetchError && (
            <p className="text-red-400 py-2">&gt; Error: {fetchError}</p>
          )}

          {!loadingRoadmaps && !fetchError && user && roadmaps.length === 0 && (
            <p className="text-textFaint py-2">
              &gt; No roadmaps saved yet. Generate a roadmap while signed in to save automatically.
            </p>
          )}

          {!user && (
            <p className="text-textFaint py-2">
              &gt; Sign in with GitHub to view your saved roadmaps from Firestore.
            </p>
          )}

          {!loadingRoadmaps && roadmaps.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Roadmaps successfully loaded (logged to console)</span>
              </p>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {roadmaps.map((r) => (
                  <div
                    key={r.id}
                    className="bg-surfaceMuted p-2.5 rounded border border-border/60 flex items-center justify-between"
                  >
                    <span className="text-textPrimary font-semibold">{r.project_title || 'Untitled'}</span>
                    <span className="text-[10px] text-textFaint">{r.timeframe_label || 'Roadmap'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
