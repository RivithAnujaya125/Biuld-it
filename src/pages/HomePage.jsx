import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  Clock,
  GitPullRequest,
  History,
  Lightbulb,
  SlidersHorizontal,
  CodeXml,
  Terminal,
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate, createScope, createTimeline, stagger } from 'animejs'
import Brand from '../components/Brand'
import { BeamsBackground } from '../components/ui/beams-background'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { icon: SlidersHorizontal, title: "Tell us where you're at", description: 'Your skill level, stack, career goal, and how much time you have.' },
  { icon: Lightbulb, title: 'Get a real, scoped project', description: 'Gemini generates one specific project with a milestone-by-milestone breakdown.' },
  { icon: CircleCheck, title: 'Build it, then prove it', description: 'Connect your repo and build.it verifies progress milestone by milestone.' },
]

const features = [
  { icon: BrainCircuit, title: 'AI that actually reasons', description: 'Powered by Gemini Flash with deep reasoning, not a generic prompt wrapper.' },
  { icon: GitPullRequest, title: 'Real GitHub verification', description: 'We check your actual code against your roadmap.' },
  { icon: History, title: 'Your dashboard, your history', description: 'Every roadmap you generate and verify, tracked in one place.' },
  { icon: CodeXml, title: 'Open source, always', description: 'No paywalls, no tiers. Self-hosted and transparent by design.' },
]

/* Sample roadmap illustrating the real ResultsScreen UI shape.
   Explicitly labeled as a sample — never a metric or testimonial. */
const SAMPLE_MILESTONES = [
  { title: 'Markdown editor + local persistence', time: '3 days', status: 'Complete' },
  { title: 'Project tags + filtering', time: '3 days', status: 'Complete' },
  { title: 'Weekly timeline view', time: '4 days', status: 'In Progress' },
  { title: 'Export + polish', time: '4 days', status: 'Not Started' },
]
const SAMPLE_STACK = ['React', 'TypeScript', 'Tailwind CSS', 'localStorage']

const buttonClass = 'inline-flex items-center justify-center gap-3 rounded-sm bg-accent px-5 py-3 font-mono text-xs font-semibold text-background transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_var(--accent)] focus-visible:outline-accent motion-reduce:transform-none'

function TechCore() {
  const faces = [
    '[transform:translateZ(64px)]',
    '[transform:rotateY(180deg)_translateZ(64px)]',
    '[transform:rotateY(90deg)_translateZ(64px)]',
    '[transform:rotateY(-90deg)_translateZ(64px)]',
    '[transform:rotateX(90deg)_translateZ(64px)]',
    '[transform:rotateX(-90deg)_translateZ(64px)]',
  ]
  return (
    <div aria-hidden="true" className="relative mx-auto mb-9 flex h-52 w-72 items-center justify-center [perspective:800px]">
      <div data-core-shadow className="absolute bottom-2 h-9 w-44 rounded-[50%] bg-accent/10 blur-xl" />
      <div className="absolute size-60 rounded-full border border-border [transform:rotateX(65deg)_rotateZ(-25deg)]">
        <div data-core-orbit className="size-full rounded-full">
          <span className="absolute top-0 left-1/2 size-1.5 bg-accent shadow-[0_0_12px_var(--accent)]" />
        </div>
      </div>
      <div data-core className="relative size-32 [transform-style:preserve-3d] [transform:rotateX(-20deg)_rotateY(35deg)]">
        {faces.map((face, index) => (
          <div key={face} className={'absolute inset-0 flex items-center justify-center border border-accent/50 bg-background/80 [backface-visibility:visible] ' + face}>
            <div className="absolute inset-2 border border-accent/10" />
            <div className="absolute inset-x-0 top-1/3 border-t border-accent/10" />
            <div className="absolute inset-x-0 top-2/3 border-t border-accent/10" />
            <div className="absolute inset-y-0 left-1/3 border-l border-accent/10" />
            <div className="absolute inset-y-0 left-2/3 border-l border-accent/10" />
            <CodeXml className="size-11 text-accent" strokeWidth={1} />
            <span className="absolute bottom-2 left-3 font-mono text-[7px] tracking-widest text-textFaint">BUILD.CORE / 0{index + 1}</span>
            <span data-core-node className="absolute top-2 right-2 size-1 bg-accent" />
          </div>
        ))}
      </div>
      <span className="absolute top-6 left-0 font-mono text-[8px] tracking-widest text-textFaint">[ CORE ONLINE ]</span>
      <span className="absolute right-0 bottom-7 font-mono text-[8px] tracking-widest text-textFaint">X:01 Y:01 Z:01</span>
    </div>
  )
}

function tiltCard(event) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const bounds = event.currentTarget.getBoundingClientRect()
  gsap.to(event.currentTarget, {
    rotationY: ((event.clientX - bounds.left) / bounds.width - 0.5) * 10,
    rotationX: -((event.clientY - bounds.top) / bounds.height - 0.5) * 10,
    transformPerspective: 1000, duration: 0.4, overwrite: 'auto', ease: 'power2.out',
  })
}

function resetCard(event) {
  gsap.to(event.currentTarget, { rotationX: 0, rotationY: 0, duration: 0.6, overwrite: 'auto', ease: 'power2.out' })
}

function Ambient() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="ambient-grid absolute -inset-16 opacity-20" />
      <div className="ambient-glow absolute inset-x-0 top-[5%] h-[85%] opacity-[0.075]" />
    </div>
  )
}

function RoadmapBackground({ children, className = '' }) {
  return (
    <BeamsBackground intensity="subtle" className={`bg-bg ${className}`}>
      <div className="relative z-10 w-full">{children}</div>
    </BeamsBackground>
  )
}

export { RoadmapBackground }

function displayNameFor(user) {
  if (!user) return 'builder'
  return user.reloadUserInfo?.screenName || user.displayName || user.email?.split('@')[0] || 'builder'
}

function SampleRoadmapPreview() {
  return (
    <div aria-label="Sample roadmap preview" className="flex flex-col gap-5 text-left">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="font-semibold text-accent uppercase">Recommended Specification</span>
          <span className="h-px w-2 bg-border" />
          <span className="text-textMuted">Sample roadmap</span>
        </div>
        <p className="text-xl leading-snug font-extrabold text-textPrimary sm:text-2xl">
          DevLog — a markdown journal for ship logs
        </p>
        <p className="text-sm text-textMuted">Write daily ship logs in markdown, tag them by project, and review a weekly timeline of what you built.</p>
      </div>
      <div className="flex flex-col gap-2 rounded-md border border-accent bg-accent/[0.03] p-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-accent" />
          <span className="text-[13px] font-bold text-accent">Why this fits your profile</span>
        </div>
        <p className="text-[13px] leading-relaxed text-textMuted">Frontend focus, 2-week window, Frontend Role goal: one scoped shippable app with visible UI progress every milestone.</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-textMuted uppercase">Project Tech Stack</span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_STACK.map((tech) => (
            <span key={tech} className="rounded-md border border-accent bg-accent/10 px-2.5 py-1.5 font-mono text-xs text-accent">{tech}</span>
          ))}
        </div>
      </div>
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-textMuted uppercase">Milestone Execution Breakdown</span>
          <span className="font-mono text-[11px] text-textFaint">2 Weeks</span>
        </div>
        <div className="flex flex-col">
          {SAMPLE_MILESTONES.map((m, i) => (
            <div key={m.title} className="flex gap-4">
              <div className="flex w-6 flex-col items-center">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold ${m.status === 'Complete' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' : m.status === 'In Progress' ? 'border-amber-500 bg-amber-950/40 text-amber-400' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                {i < SAMPLE_MILESTONES.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
              </div>
              <div className={`flex flex-1 flex-col ${i < SAMPLE_MILESTONES.length - 1 ? 'pb-6' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-bold text-textPrimary">{m.title}</p>
                    {m.status === 'Complete' && (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 size={12} className="text-emerald-400" /> Complete
                      </span>
                    )}
                    {m.status === 'In Progress' && (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-400">
                        <Clock size={12} className="text-amber-400" /> In Progress
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 rounded bg-border px-2 py-1 font-mono text-[11px] text-textMuted">{m.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage({ user, onOpenDashboard, onGenerate, onHome }) {
  const page = useRef(null)
  const [lifted, setLifted] = useState(false)
  const name = displayNameFor(user)
  const firstName = String(name).split(/[^a-zA-Z0-9_]+/)[0] || name
  const handle = `@${name}`
  useEffect(() => {
    document.title = 'Welcome to build.it'
    const onScroll = () => setLifted(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const scope = createScope({ root: page, mediaQueries: { reduced: '(prefers-reduced-motion: reduce)' } })
    scope.add(() => {
      if (scope.matches.reduced) return
      createTimeline({ defaults: { ease: 'out(3)' } })
        .add('[data-hero-chip]', { opacity: [0, 1], translateY: [10, 0], duration: 550 }, 0)
        .add('[data-hero-letter]', { opacity: [0, 1], translateY: [18, 0], rotateX: [-45, 0], delay: stagger(24), duration: 700 }, 180)
        .add('[data-hero-description]', { opacity: [0, 1], translateY: [12, 0], duration: 700 }, 700)
      // TechCore cube loops — guard so anime.js never warns
      // "No target found" if TechCore is ever absent from the DOM.
      if (!page.current?.querySelector('[data-core]')) return
      const loops = [
        animate('[data-core]', { rotateY: [35, 395], rotateX: -20, duration: 24000, loop: true, ease: 'linear' }),
        animate('[data-core]', { translateY: [0, -12], duration: 2800, alternate: true, loop: true, ease: 'inOutSine' }),
        animate('[data-core-orbit]', { rotateZ: [0, 360], duration: 12000, loop: true, ease: 'linear' }),
      ]
      const observer = new IntersectionObserver((entries) => {
        loops.forEach((a) => (entries[0].isIntersecting ? a.resume() : a.pause()))
      })
      const core = page.current?.querySelector('[data-core]')
      if (core) observer.observe(core)
      return () => observer.disconnect()
    })
    return () => scope.revert()
  }, [])
  useEffect(() => {
    const media = gsap.matchMedia()
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, (context) => {
      // Guard: page can be null during view transitions — without this
      // gsap.utils.toArray throws "Invalid scope".
      if (!page.current) return
      const reduced = context.conditions?.reduced
      gsap.utils.toArray('[data-reveal-grid]', page.current).forEach((grid) => {
        gsap.fromTo(grid.querySelectorAll('[data-reveal]'),
          { opacity: 0, y: reduced ? 0 : 35 },
          { opacity: 1, y: 0, duration: reduced ? 0 : 0.65, stagger: reduced ? 0 : 0.15, ease: 'power2.out', scrollTrigger: { trigger: grid, start: 'top 88%', once: true } })
      })
      gsap.utils.toArray('[data-screenshot]', page.current).forEach((shot) => {
        gsap.fromTo(shot,
          { opacity: 0, scale: reduced ? 1 : 0.96 },
          { opacity: 1, scale: 1, duration: reduced ? 0 : 0.4, ease: 'power2.out', scrollTrigger: { trigger: shot, start: 'top 85%', once: true } })
      })
    }, page)
    return () => media.revert()
  }, [])
  return (
    <div ref={page} className="min-h-screen bg-background text-foreground antialiased">
      <BeamsBackground intensity="subtle" className="bg-background [&>div]:relative [&>div]:z-10">
        <header className={`sticky top-0 z-20 h-20 border-b border-border ${lifted ? 'bg-background/95 backdrop-blur-xl' : 'bg-background'}`}>
        <nav aria-label="Main navigation" className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-5 md:px-10">
          <button type="button" onClick={onHome} aria-label="Biuld-it home" className="flex cursor-pointer items-center gap-2.5 bg-transparent">
            <Brand size="md" />
          </button>
          <div className="flex items-center gap-5 md:gap-7">
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="flex size-7 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs text-textMuted">{(firstName[0] || 'B').toUpperCase()}</span>
              <span className="font-mono text-xs text-textMuted">{handle}</span>
            </div>
            <button type="button" data-anime-cta onClick={onOpenDashboard} className={`${buttonClass} cursor-pointer px-3.5 py-2.5 sm:px-5`}>
              Go to Dashboard <ArrowRight className="size-3.5" />
            </button>
          </div>
        </nav>
      </header>
      <main className="relative z-10">
        <section className="relative flex min-h-[calc(100svh-80px)] items-center justify-center overflow-hidden px-6 pt-16 pb-32">
          <div className="relative mx-auto w-full max-w-[720px] text-center">
            <TechCore />
            <div data-hero-chip className="mb-8 inline-flex items-center gap-2 border border-accent/25 bg-background/60 px-3.5 py-2 font-mono text-[10px] tracking-[0.12em] text-accent uppercase sm:text-xs">
              <span className="size-1.5 bg-accent" />[ SIGNED IN AS {handle} ]
            </div>
            <h1 className="font-mono text-[clamp(32px,4.5vw,58px)] leading-[1.22] font-normal tracking-[-0.03em]">
              <span>Welcome to build.it,</span><br />
              <span className="text-accent">{firstName}.</span>
              <span className="ml-2 inline-block h-[0.8em] w-[0.35em] bg-accent align-baseline" />
            </h1>
            <p data-hero-description className="mx-auto mt-4 max-w-xl font-mono text-sm leading-7 font-light tracking-[0.1em] text-textMuted uppercase">
              You are about to stop guessing what to build next.
            </p>
            <div className="mx-auto mt-10 flex items-center justify-center gap-3 font-mono text-[10px] tracking-wide text-textFaint">
              <span className="h-px w-6 bg-border" /><span>LESS GUESSWORK. MORE BUILDING.</span><span className="h-px w-6 bg-border" />
            </div>
          </div>
          <a href="#how-it-works" className="absolute bottom-10 flex flex-col items-center gap-3 font-mono text-[10px] tracking-[0.14em] text-textFaint uppercase transition hover:text-accent">
            Scroll to explore <ChevronDown data-scroll-chevron className="size-4" />
          </a>
        </section>
        <section id="how-it-works" className="scroll-mt-20 border-t border-border px-6 py-24 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-textFaint">THE PROCESS / 01</p>
              <h2 className="font-mono text-[clamp(28px,3vw,42px)] font-medium"><span className="text-textFaint">{'// '}How it works</span></h2>
            </div>
            <div data-reveal-grid className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <article data-reveal onPointerMove={tiltCard} onPointerLeave={resetCard} key={step.title} className="relative overflow-hidden rounded-lg border border-border bg-surface p-8">
                  <span aria-hidden="true" className="absolute top-5 right-6 font-mono text-5xl font-normal text-textFaint/30">0{index + 1}</span>
                  <step.icon className="relative mb-9 size-7 text-accent" strokeWidth={1.5} />
                  <h3 className="relative mb-4 font-mono text-[16px] leading-7 font-semibold">{step.title}</h3>
                  <p className="relative text-sm leading-7 text-textMuted">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="border-t border-border px-6 py-24 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-textFaint">THE TOOLKIT / 03</p>
              <h2 className="font-mono text-[clamp(28px,3vw,42px)] font-medium"><span className="text-textFaint">{'// '}What you get</span></h2>
            </div>
            <div data-reveal-grid className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
              {features.map((feature) => (
                <article data-reveal onPointerMove={tiltCard} onPointerLeave={resetCard} key={feature.title} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-8 sm:flex-row sm:gap-6">
                  <feature.icon className="size-7 shrink-0 text-accent" strokeWidth={1.5} />
                  <div><h3 className="mb-3 font-mono text-[16px] font-semibold">{feature.title}</h3><p className="max-w-md text-sm leading-7 text-textMuted">{feature.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="border-t border-border px-6 py-24 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-textFaint">SEE IT IN ACTION / 02</p>
              <h2 className="font-display text-[clamp(28px,3vw,42px)] font-semibold leading-tight">
                This isn&apos;t a mockup — here&apos;s a real one.
              </h2>
              <p className="mx-auto mt-4 max-w-[560px] text-sm leading-7 text-textMuted">
                Every roadmap looks like this: one specific project, a clear reason it fits you, and milestones you can actually check off.
              </p>
            </div>
            <div data-screenshot className="mx-auto mt-14 max-w-3xl">
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-1.5 border-b border-border bg-surfaceMuted px-4 py-3" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="ml-3 hidden font-mono text-[11px] text-textFaint sm:block">build.it — your roadmap</span>
                </div>
                <div className="p-6 sm:p-8">
                  <SampleRoadmapPreview />
                </div>
              </div>
              <p className="mt-4 text-center font-mono text-[11px] text-textFaint">
                Sample roadmap layout from build.it — powered by Gemini Flash, generated in seconds.
              </p>
            </div>
          </div>
        </section>
        <section className="relative overflow-hidden border-t border-border px-6 py-[clamp(80px,10vw,140px)] text-center">
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.12em] text-textFaint"><Check className="size-3.5 text-accent" /> YOU ARE IN. NOW MAKE IT COUNT.</div>
            <h2 className="font-mono text-[clamp(28px,3.5vw,48px)] leading-[1.3] font-light">Ready to find out what<br className="hidden sm:block" /> you should build next?</h2>
            <button type="button" data-anime-cta onClick={onGenerate} className={`${buttonClass} mt-9 min-h-14 cursor-pointer px-7 text-sm`}>Generate My First Roadmap <ArrowRight className="size-4" /></button>
            <div className="mt-5"><button type="button" onClick={onOpenDashboard} className="cursor-pointer bg-transparent font-mono text-xs text-textMuted underline-offset-4 hover:underline">Or explore your dashboard first</button></div>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t border-border px-6 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 font-mono text-[10px] text-textMuted sm:flex-row sm:gap-6">
          <span>© {new Date().getFullYear()} <Brand size="sm" className="inline" />. Built for what comes next.</span>
        </div>
      </footer>
      </BeamsBackground>
    </div>
  )
}

