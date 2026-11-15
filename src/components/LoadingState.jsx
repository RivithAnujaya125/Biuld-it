import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { gsap } from 'gsap'
import { flattenStack } from '../lib/gemini'
import AppShell from './AppShell'
import { isReducedMotion } from '../lib/motion'

export default function LoadingState({ inputs }) {
  const cardRef = useRef(null)
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    if (isReducedMotion()) {
      if (cardRef.current) {
        cardRef.current.style.opacity = '1'
        cardRef.current.style.transform = 'none'
      }
      return
    }

    // Card entrance
    animate(cardRef.current, {
      opacity: [0, 1],
      y: [16, 0],
      duration: 500,
      ease: 'outQuad',
    })

    // Inner items entrance stagger
    const staggerItems = cardRef.current?.querySelectorAll('.loading-stagger-item')
    if (staggerItems && staggerItems.length > 0) {
      gsap.fromTo(
        staggerItems,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
          delay: 0.04,
        }
      )
    }

    // Continuous loading loop animations
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

  const allTech = flattenStack(inputs.stack)
  const domain =
    inputs.domainInterest && inputs.domainInterest !== 'No Preference'
      ? inputs.domainInterest.toUpperCase()
      : null

  return (
    <AppShell>
      <div
        ref={cardRef}
        style={{ opacity: 0 }}
        className="bg-surface border border-border rounded-lg p-12 w-[540px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8"
      >
        <div className="loading-stagger-item relative w-[72px] h-[72px] flex items-center justify-center">
          <div
            ref={ringRef}
            className="absolute w-[72px] h-[72px] rounded-full border-2 border-dashed border-accent/50"
          />
          <div className="absolute w-[52px] h-[52px] rounded-full border-2 border-border" />
          <div ref={dotRef} className="w-6 h-6 rounded-full bg-accent" />
        </div>
        <div className="loading-stagger-item flex flex-col items-center gap-3 w-full">
          <p className="font-bold text-textPrimary text-base">Synthesizing Project Scaffolding</p>
          <div className="bg-surfaceMuted h-1 w-[280px] rounded-full overflow-hidden">
            <div ref={barRef} className="bg-accent h-full" style={{ width: '20%' }} />
          </div>
          <div className="flex flex-col items-center gap-1 pt-3 font-mono text-[11px]">
            <p className="text-accent">{`> ANALYZING: [${allTech.join(', ')}]...`}</p>
            <p className="text-textFaint">
              {`SCOPING MILESTONES FOR '${inputs.goal.toUpperCase()}'`}
              {domain ? ` × ${domain}` : ''}
              {'...'}
            </p>
            <p className="text-textFaint">
              {`FOCUS: ${(inputs.strongestArea || 'GENERAL').toUpperCase()} | TIMEFRAME: ${inputs.timeFrame.toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
