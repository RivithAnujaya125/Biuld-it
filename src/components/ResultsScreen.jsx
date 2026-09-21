import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Lightbulb } from 'lucide-react'
import AppShell from './AppShell'

// ScrollTrigger is registered once in App.jsx — no duplicate registration needed here.

export default function ResultsScreen({ result, onRegenerate, onAdjust }) {
  const containerRef = useRef(null)
  const milestoneRefs = useRef([])
  milestoneRefs.current = []

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

  return (
    <AppShell statusLabel="GenAI Scoper Active" subLabel="Output Scopes / Code Generation Completed">
      <div
        ref={containerRef}
        className="bg-surface border border-border rounded-lg p-10 w-[760px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col gap-8"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-accent uppercase font-semibold">Recommended Specification</span>
            <span className="w-2 h-px bg-border" />
            <span className="text-textMuted">Generated Roadmap</span>
          </div>
          <h1 className="text-[32px] font-extrabold leading-tight text-textPrimary">{result.project_title}</h1>
          <p className="text-textMuted text-base">{result.description}</p>
        </div>

        <div className="bg-accent/[0.03] border border-accent rounded-md p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-accent" />
            <span className="text-accent font-bold text-[13px]">Why this fits your profile</span>
          </div>
          <p className="text-textMuted text-[13px] leading-relaxed">{result.why_it_fits}</p>
        </div>

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

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-textMuted">Milestone Execution Breakdown</label>
            <span className="font-mono text-[11px] text-textFaint">{result.timeframe_label}</span>
          </div>
          <div className="flex flex-col">
            {result.milestones.map((m, i) => (
              <div key={i} ref={registerMilestoneRef} className="flex gap-5">
                <div className="flex flex-col items-center w-6">
                  <div className="w-6 h-6 rounded-full bg-border border-2 border-accent flex items-center justify-center font-mono font-bold text-[10px] text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {i < result.milestones.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className={`flex-1 flex flex-col ${i < result.milestones.length - 1 ? 'pb-7' : ''}`}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-textPrimary text-base">{m.title}</p>
                    <span className="bg-border rounded px-2 py-1 font-mono text-[11px] text-textMuted shrink-0">
                      {m.estimated_time}
                    </span>
                  </div>
                  <p className="text-textMuted text-[13px] leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onRegenerate}
            className="bg-border px-5 py-3 rounded-md font-semibold text-textPrimary text-[13px]"
          >
            Regenerate Idea
          </button>
          <button type="button" onClick={onAdjust} className="px-5 py-3 rounded-md font-medium text-textMuted text-[13px]">
            Adjust inputs
          </button>
        </div>
      </div>
    </AppShell>
  )
}
