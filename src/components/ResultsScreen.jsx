import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Lightbulb,
  Github,
  CheckCircle2,
  Clock,
  Circle,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'
import AppShell from './AppShell'
import VerificationLoading from './VerificationLoading'

export default function ResultsScreen({ result, onRegenerate, onAdjust, onOpenDashboard }) {
  const containerRef = useRef(null)
  const milestoneRefs = useRef([])
  milestoneRefs.current = []

  // Verification state
  const [repoUrl, setRepoUrl] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationData, setVerificationData] = useState(null)
  const [error, setError] = useState(null)
  const [expandedEvidence, setExpandedEvidence] = useState({})

  const registerMilestoneRef = (el) => {
    if (el) milestoneRefs.current.push(el)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(milestoneRefs.current, {
        opacity: 0,
        y: 24,
        stagger: 0.15,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [result])

  const toggleEvidence = (index) => {
    setExpandedEvidence((prev) => {
      const updated = { ...prev, [index]: !prev[index] }
      setTimeout(() => ScrollTrigger.refresh(), 50)
      return updated
    })
  }

  const handleVerify = async (e) => {
    e?.preventDefault()
    if (!repoUrl.trim() || isVerifying) return

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          milestones: result.milestones,
          techStack: result.tech_stack,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `Verification failed (${response.status})`)
      }

      setVerificationData(data)

      // Auto-expand evidence for completed or in-progress milestones
      const initialExpanded = {}
      data.milestone_statuses?.forEach((item) => {
        if (item.status === 'Complete' || item.status === 'In Progress') {
          initialExpanded[item.milestone_index] = true
        }
      })
      setExpandedEvidence(initialExpanded)

      setTimeout(() => ScrollTrigger.refresh(), 100)
    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResetVerification = () => {
    setVerificationData(null)
    setError(null)
    setTimeout(() => ScrollTrigger.refresh(), 50)
  }

  // Calculate completion statistics if verified
  const totalMilestones = result.milestones?.length || 0
  const completedCount =
    verificationData?.milestone_statuses?.filter((s) => s.status === 'Complete').length || 0
  const inProgressCount =
    verificationData?.milestone_statuses?.filter((s) => s.status === 'In Progress').length || 0

  return (
    <AppShell
      statusLabel="GenAI Scoper Active"
      subLabel="Output Scopes / Code Generation Completed"
      onOpenDashboard={onOpenDashboard}
    >
      <div
        ref={containerRef}
        className="bg-surface border border-border rounded-lg p-10 w-[760px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col gap-8"
      >
        {/* Header Specification */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-accent uppercase font-semibold">Recommended Specification</span>
            <span className="w-2 h-px bg-border" />
            <span className="text-textMuted">Generated Roadmap</span>
          </div>
          <h1 className="text-[32px] font-extrabold leading-tight text-textPrimary">
            {result.project_title}
          </h1>
          <p className="text-textMuted text-base">{result.description}</p>
        </div>

        {/* Why this fits */}
        <div className="bg-accent/[0.03] border border-accent rounded-md p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-accent" />
            <span className="text-accent font-bold text-[13px]">Why this fits your profile</span>
          </div>
          <p className="text-textMuted text-[13px] leading-relaxed">{result.why_it_fits}</p>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-textMuted">Project Tech Stack</label>
          <div className="flex flex-wrap gap-2">
            {result.tech_stack.map((tech) => (
              <span
                key={tech}
                className="bg-accent/10 border border-accent rounded-md px-2.5 py-1.5 font-mono text-xs text-accent"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Milestones Timeline */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase text-textMuted">
                Milestone Execution Breakdown
              </label>
              {verificationData && (
                <span className="font-mono text-[11px] bg-surfaceMuted border border-border px-2 py-0.5 rounded text-accent">
                  {completedCount}/{totalMilestones} Completed
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-textFaint">{result.timeframe_label}</span>
          </div>

          <div className="flex flex-col">
            {result.milestones.map((m, i) => {
              const statusInfo = verificationData?.milestone_statuses?.find(
                (s) => s.milestone_index === i
              )
              const isExpanded = !!expandedEvidence[i]

              // Dynamic timeline indicator style based on verification status
              let circleBorder = 'border-accent text-accent'
              let circleBg = 'bg-border'
              if (statusInfo) {
                if (statusInfo.status === 'Complete') {
                  circleBorder = 'border-emerald-500 text-emerald-400'
                  circleBg = 'bg-emerald-950/40'
                } else if (statusInfo.status === 'In Progress') {
                  circleBorder = 'border-amber-500 text-amber-400'
                  circleBg = 'bg-amber-950/40'
                } else {
                  circleBorder = 'border-zinc-700 text-zinc-500'
                  circleBg = 'bg-zinc-900'
                }
              }

              return (
                <div key={i} ref={registerMilestoneRef} className="flex gap-5">
                  {/* Timeline node */}
                  <div className="flex flex-col items-center w-6">
                    <div
                      className={`w-6 h-6 rounded-full ${circleBg} border-2 ${circleBorder} flex items-center justify-center font-mono font-bold text-[10px] transition-colors`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    {i < result.milestones.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>

                  {/* Milestone Content */}
                  <div className={`flex-1 flex flex-col ${i < result.milestones.length - 1 ? 'pb-7' : ''}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-bold text-textPrimary text-base">{m.title}</p>
                        {statusInfo && (
                          <>
                            {statusInfo.status === 'Complete' && (
                              <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                Complete
                              </span>
                            )}
                            {statusInfo.status === 'In Progress' && (
                              <span className="bg-amber-950/60 border border-amber-500/40 text-amber-400 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                                <Clock size={12} className="text-amber-400" />
                                In Progress
                              </span>
                            )}
                            {statusInfo.status === 'Not Started' && (
                              <span className="bg-zinc-800/80 border border-zinc-700 text-zinc-400 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0">
                                <Circle size={12} className="text-zinc-500" />
                                Not Started
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <span className="bg-border rounded px-2 py-1 font-mono text-[11px] text-textMuted shrink-0">
                        {m.estimated_time}
                      </span>
                    </div>

                    <p className="text-textMuted text-[13px] leading-relaxed mt-1">{m.description}</p>

                    {/* Expandable Verification Evidence & Diagnostics */}
                    {statusInfo && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleEvidence(i)}
                          className="flex items-center gap-1.5 text-xs font-mono text-textMuted hover:text-accent transition-colors self-start"
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          <span>{isExpanded ? 'Hide Verification Evidence' : 'View Verification Evidence'}</span>
                          {statusInfo.evidence?.length > 0 && (
                            <span className="bg-surface border border-border text-accent text-[10px] px-1.5 py-0.5 rounded ml-1 font-mono">
                              {statusInfo.evidence.length} file{statusInfo.evidence.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 bg-surfaceMuted/80 border border-border rounded-md p-4 flex flex-col gap-3">
                            {statusInfo.evidence?.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                <span className="font-mono text-[10px] uppercase font-semibold text-textFaint tracking-wider">
                                  Relevant Code Evidence:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {statusInfo.evidence.map((filePath) => (
                                    <span
                                      key={filePath}
                                      className="bg-surface border border-border text-accent font-mono text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5"
                                    >
                                      <FileCode2 size={11} className="text-accent/70" />
                                      {filePath}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-textFaint font-mono text-[11px] italic">
                                <span>No source files in the repo meet this milestone's requirements yet.</span>
                              </div>
                            )}

                            <div className="flex flex-col gap-1 pt-2 border-t border-border/40">
                              <span className="font-mono text-[10px] uppercase font-semibold text-textFaint tracking-wider">
                                Code Reasoning Evaluation:
                              </span>
                              <p className="text-textMuted text-xs leading-relaxed">
                                {statusInfo.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* VERIFY MY PROGRESS SECTION */}
        <div className="bg-surfaceMuted border border-border rounded-lg p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <Github size={18} />
              </div>
              <div>
                <h3 className="font-bold text-textPrimary text-base">Verify My Progress</h3>
                <p className="text-textMuted text-xs">
                  Inspect your actual GitHub repository commits against this milestone roadmap
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-border text-accent bg-accent/5">
              Gemini 3.8 Flash • High Reasoning
            </span>
          </div>

          {/* Verification Loading State */}
          {isVerifying && <VerificationLoading repoUrl={repoUrl} />}

          {/* Error Message */}
          {!isVerifying && error && (
            <div className="bg-red-950/40 border border-red-800/80 rounded-md p-4 flex items-start gap-3 text-red-200 text-xs">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col gap-1">
                <span className="font-semibold text-red-300">Verification Notice</span>
                <p className="text-red-200/90 leading-relaxed font-mono text-[11px]">{error}</p>
              </div>
            </div>
          )}

          {/* Verification Result Summary */}
          {!isVerifying && verificationData && (
            <div className="flex flex-col gap-4">
              <div className="bg-surface border border-border rounded-md p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-textPrimary text-sm font-mono">
                      {verificationData.repo}
                    </span>
                    <span className="bg-border text-textMuted font-mono text-[10px] px-1.5 py-0.5 rounded">
                      branch: {verificationData.branch}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs px-2.5 py-1 rounded">
                      {completedCount} of {totalMilestones} Milestones Complete
                    </span>
                    {inProgressCount > 0 && (
                      <span className="bg-amber-950/40 border border-amber-500/30 text-amber-400 font-mono text-xs px-2.5 py-1 rounded">
                        {inProgressCount} In Progress
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-textMuted text-xs leading-relaxed">
                  {verificationData.summary}
                </p>

                {verificationData.warnings && verificationData.warnings.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
                    {verificationData.warnings.map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-950/30 border border-amber-800/50 rounded p-2 text-amber-300 font-mono text-[10px] flex items-center gap-2"
                      >
                        <AlertTriangle size={13} className="shrink-0 text-amber-400" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-textFaint">
                  Verified with {verificationData.verifiedWith || 'Gemini 3.8 Flash'} (Thinking: HIGH)
                </span>
                <button
                  type="button"
                  onClick={handleResetVerification}
                  className="flex items-center gap-1.5 text-xs font-mono text-textMuted hover:text-textPrimary transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Verify another repository</span>
                </button>
              </div>
            </div>
          )}

          {/* Repository Input Form */}
          {!isVerifying && !verificationData && (
            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value)
                      setError(null)
                    }}
                    placeholder="https://github.com/username/repository or username/repository"
                    className="w-full bg-surface border border-border focus:border-accent rounded-md px-3.5 py-2.5 text-textPrimary font-mono text-xs placeholder:text-textFaint focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!repoUrl.trim()}
                  className="bg-accent text-bg hover:bg-accent/90 disabled:opacity-40 disabled:hover:bg-accent px-5 py-2.5 rounded-md font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
                >
                  <Sparkles size={14} />
                  <span>Verify Progress</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-textFaint">
                * Evaluates public repositories (GitHub REST API limit: 60 req/hr unauthenticated).
              </p>
            </form>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Footer actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onRegenerate}
            className="bg-border px-5 py-3 rounded-md font-semibold text-textPrimary text-[13px] hover:bg-border/80 transition-colors"
          >
            Regenerate Idea
          </button>
          <button
            type="button"
            onClick={onAdjust}
            className="px-5 py-3 rounded-md font-medium text-textMuted text-[13px] hover:text-textPrimary transition-colors"
          >
            Adjust inputs
          </button>
        </div>
      </div>
    </AppShell>
  )
}
