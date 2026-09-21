import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import AppShell from './AppShell'

export default function LoadingState({ inputs }) {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const anims = [
      animate(ringRef.current, {
        rotate: 360,
        duration: 2400,
        loop: true,
        ease: 'linear',
      }),
      animate(dotRef.current, {
        scale: [1, 1.25, 1],
        opacity: [1, 0.6, 1],
        duration: 1200,
        loop: true,
        ease: 'inOutSine',
      }),
      animate(barRef.current, {
        width: ['20%', '85%'],
        duration: 1800,
        loop: true,
        alternate: true,
        ease: 'inOutQuad',
      }),
    ]
    return () => anims.forEach((a) => a.pause())
  }, [])

  return (
    <AppShell statusLabel="GenAI Scoper Active" subLabel="Processing Machine-Scoping Logic">
      <div className="bg-surface border border-border rounded-lg p-12 w-[540px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8">
        <div className="relative w-[72px] h-[72px] flex items-center justify-center">
          <div
            ref={ringRef}
            className="absolute w-[72px] h-[72px] rounded-full border-2 border-dashed border-accent/50"
          />
          <div className="absolute w-[52px] h-[52px] rounded-full border-2 border-border" />
          <div ref={dotRef} className="w-6 h-6 rounded-full bg-accent" />
        </div>
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="font-bold text-textPrimary text-base">Synthesizing Project Scaffolding</p>
          <div className="bg-surfaceMuted h-1 w-[280px] rounded-full overflow-hidden">
            <div ref={barRef} className="bg-accent h-full" style={{ width: '20%' }} />
          </div>
          <div className="flex flex-col items-center gap-1 pt-3 font-mono text-[11px]">
            <p className="text-accent">{`> ANALYZING: [${inputs.stack.join(', ')}]...`}</p>
            <p className="text-textFaint">{`SCOPING MILESTONES FOR '${inputs.goal.toUpperCase()}'...`}</p>
            <p className="text-textFaint">{`TIMEFRAME ESTIMATE: ${inputs.timeFrame.toUpperCase()}`}</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
