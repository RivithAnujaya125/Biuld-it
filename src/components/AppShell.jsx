import Brand from './Brand'
import { Github } from 'lucide-react'
import { BeamsBackground } from './ui/beams-background'

export default function AppShell({ onOpenDashboard, children, beams = 'subtle' }) {
  return (
    <BeamsBackground intensity={beams} className="bg-bg [&>div]:relative [&>div]:z-10">
      <div className="flex min-h-screen flex-col">
        <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg px-12">
        <div className="flex items-center gap-3">
          <Brand size="md" />
          <span className="bg-border text-textMuted font-mono font-semibold text-[10px] px-1.5 py-0.5 rounded">
            v1.0.4
          </span>
        </div>
        <div className="flex items-center gap-6 text-textMuted text-[13px]">
          <span>Documentation</span>
          {onOpenDashboard ? (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="hover:text-textPrimary transition-colors cursor-pointer text-[13px]"
            >
              Dashboard
            </button>
          ) : (
            <span>Dashboard</span>
          )}
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 font-mono text-xs">
            <Github size={16} />
            <span>build-it-labs</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-12 py-16">
        <div className="relative z-10 flex w-full justify-center">{children}</div>
      </main>

      <footer className="relative z-10 flex shrink-0 items-center justify-between border-t border-border px-12 py-6 text-xs text-textFaint">
        <span>© 2026 <Brand size="sm" className="inline" />. Under MIT License.</span>
        <div className="flex gap-4 font-mono text-[11px]">
          <span>Terms</span>
          <span>Telemetry: Off</span>
        </div>
      </footer>
      </div>
    </BeamsBackground>
  )
}
