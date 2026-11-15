import { useState } from 'react'
import { Briefcase, Check, Copy } from 'lucide-react'

/**
 * Copyable resume-bullet callout. Rendered only when the model returns a
 * non-empty `resume_bullet` (i.e. Resume Bullet purpose roadmaps).
 */
export function ResumeBulletCallout({ text }) {
  const [copied, setCopied] = useState(false)
  if (!text || !String(text).trim()) return null

  const handleCopy = async (e) => {
    e?.stopPropagation()
    try {
      await navigator.clipboard.writeText(String(text).trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="results-stagger-item flex flex-col gap-2 rounded-md border border-accent bg-accent/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-accent" />
          <span className="text-[13px] font-bold text-accent">Resume-ready one-liner</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surfaceMuted px-2.5 py-1.5 font-mono text-[11px] text-textMuted transition-colors hover:border-accent hover:text-accent"
          aria-label="Copy resume bullet"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <p className="text-[13px] leading-relaxed text-textMuted">{text}</p>
    </div>
  )
}
