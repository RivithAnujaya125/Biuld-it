import { FileCode2, Github } from 'lucide-react'

export default function AppShell({ statusLabel, subLabel, onOpenDashboard, children }) {
  return (
    <div className="bg-bg min-h-screen flex flex-col">
      <header className="bg-bg border-b border-border h-16 flex items-center justify-between px-12 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 border-[1.5px] border-accent rounded-md w-7 h-7 flex items-center justify-center">
            <FileCode2 size={14} className="text-accent" />
          </div>
          <span className="font-bold text-textPrimary text-lg">build.it</span>
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

      <div className="bg-surfaceMuted border-b border-border flex items-center justify-between px-12 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[11px] text-textMuted">{statusLabel}</span>
        </div>
        <span className="font-mono text-[11px] text-textFaint">{subLabel}</span>
      </div>

      <main className="flex-1 flex items-center justify-center px-12 py-16">{children}</main>

      <footer className="border-t border-border flex items-center justify-between px-12 py-6 text-textFaint text-xs shrink-0">
        <span>© 2026 build.it. Under MIT License.</span>
        <div className="flex gap-4 font-mono text-[11px]">
          <span>Terms</span>
          <span>Telemetry: Off</span>
        </div>
      </footer>
    </div>
  )
}
