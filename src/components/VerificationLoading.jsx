import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

const DIAGNOSTIC_STEPS = [
  'Connecting to GitHub REST API...',
  'Fetching repository tree structure...',
  'Filtering source code & ignoring build artifacts...',
  'Fetching source file contents...',
  'Initializing Gemini 3.8 Flash (High Thinking Level)...',
  'Cross-referencing codebase against roadmap milestones...',
  'Synthesizing milestone statuses and code evidence...',
]

export default function VerificationLoading({ repoUrl }) {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const barRef = useRef(null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const anims = [
      animate(ringRef.current, {
        rotate: 360,
        duration: 2200,
        loop: true,
        ease: 'linear',
      }),
      animate(dotRef.current, {
        scale: [1, 1.3, 1],
        opacity: [1, 0.5, 1],
        duration: 1100,
        loop: true,
        ease: 'inOutSine',
      }),
      animate(barRef.current, {
        width: ['15%', '92%'],
        duration: 2000,
        loop: true,
        alternate: true,
        ease: 'inOutQuad',
      }),
    ]

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % DIAGNOSTIC_STEPS.length)
    }, 2400)

    return () => {
      anims.forEach((a) => a.pause())
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="bg-surface border border-border/80 rounded-lg p-8 w-full shadow-[0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center gap-6">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          ref={ringRef}
          className="absolute w-16 h-16 rounded-full border-2 border-dashed border-accent/60"
        />
        <div className="absolute w-11 h-11 rounded-full border-2 border-border" />
        <div ref={dotRef} className="w-5 h-5 rounded-full bg-accent shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
      </div>

      <div className="flex flex-col items-center gap-2.5 w-full text-center">
        <p className="font-bold text-textPrimary text-sm">
          Verifying Repository Implementation
        </p>
        <div className="bg-surfaceMuted h-1 w-64 rounded-full overflow-hidden">
          <div ref={barRef} className="bg-accent h-full" style={{ width: '20%' }} />
        </div>

        <div className="flex flex-col items-center gap-1 pt-2 font-mono text-[11px]">
          <p className="text-accent flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>{`> ${DIAGNOSTIC_STEPS[stepIndex]}`}</span>
          </p>
          {repoUrl && (
            <p className="text-textFaint truncate max-w-md">
              TARGET: {repoUrl}
            </p>
          )}
          <p className="text-textFaint text-[10px]">
            MODEL: GEMINI 3.8 FLASH • THINKING LEVEL: HIGH
          </p>
        </div>
      </div>
    </div>
  )
}
