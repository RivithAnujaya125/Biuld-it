import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

// Adapted from Aceternity UI's ContainerScroll for this codebase:
// - JSX (repo is .jsx, no TypeScript setup) with types stripped — no logic change.
// - Imports from the already-installed `motion` package (`motion/react`)
//   instead of adding `framer-motion` — same API, no new dependency.
// - Dropped the Next.js `"use client"` directive (Vite has no server components).
// - Card height is content-driven (`h-auto`) so the roadmap mockup isn't
//   clipped by the original fixed 30/40rem frame.
// - Palette mapped to the app theme (surface/border/text tokens).
// - Honors `prefers-reduced-motion` by rendering the settled end-state.

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
  })
  const [isMobile, setIsMobile] = React.useState(false)
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1]
  }

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions())
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: '1000px',
        }}
      >
        <Header
          translate={reduceMotion ? 0 : translate}
          titleComponent={titleComponent}
        />
        <Card
          rotate={reduceMotion ? 0 : rotate}
          scale={reduceMotion ? 1 : scale}
        >
          {children}
        </Card>
      </div>
    </div>
  )
}

export const Header = ({ translate, titleComponent }) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  )
}

export const Card = ({ rotate, scale, children }) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className="max-w-5xl -mt-12 mx-auto h-auto w-full border border-border p-2 md:p-6 bg-surface rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-surface md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  )
}

export default ContainerScroll
