import { useEffect, useRef, useState, type PointerEvent } from "react"
import {
  ArrowRight,
  Blocks,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleCheck,
  GitPullRequest,
  History,
  Lightbulb,
  SlidersHorizontal,
  CodeXml,
  Terminal,
} from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { createBrowserRouter, RouterProvider } from "react-router"
import { animate, createScope, createTimeline, stagger } from "animejs"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    icon: SlidersHorizontal,
    title: "Tell us where you're at",
    description:
      "Your skill level, stack, career goal, and how much time you've got.",
  },
  {
    icon: Lightbulb,
    title: "Get a real, scoped project",
    description:
      "Gemini generates one specific project — not generic advice — with a milestone-by-milestone breakdown.",
  },
  {
    icon: CircleCheck,
    title: "Build it, then prove it",
    description:
      "Connect your repo and build.it verifies your actual progress against the roadmap, milestone by milestone.",
  },
]
const features = [
  {
    icon: BrainCircuit,
    title: "AI that actually reasons",
    description:
      "Powered by Gemini 3.8 Flash with deep reasoning, not a generic prompt wrapper.",
  },
  {
    icon: GitPullRequest,
    title: "Real GitHub verification",
    description:
      "We check your actual code against your roadmap, not just whether you clicked a checkbox.",
  },
  {
    icon: History,
    title: "Your dashboard, your history",
    description: "Every roadmap you generate and verify, tracked in one place.",
  },
  {
    icon: CodeXml,
    title: "Open source, always",
    description:
      "No paywalls, no tiers. Self-hosted and transparent by design.",
  },
]

function TechCore() {
  const faces = [
    "[transform:translateZ(64px)]",
    "[transform:rotateY(180deg)_translateZ(64px)]",
    "[transform:rotateY(90deg)_translateZ(64px)]",
    "[transform:rotateY(-90deg)_translateZ(64px)]",
    "[transform:rotateX(90deg)_translateZ(64px)]",
    "[transform:rotateX(-90deg)_translateZ(64px)]",
  ]
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto mb-9 flex h-52 w-72 items-center justify-center [perspective:800px]"
    >
      <div
        data-core-shadow
        className="absolute bottom-2 h-9 w-44 rounded-[50%] bg-accent/10 blur-xl"
      />
      <div className="absolute size-60 rounded-full border border-border [transform:rotateX(65deg)_rotateZ(-25deg)]">
        <div data-core-orbit className="size-full rounded-full">
          <span className="absolute top-0 left-1/2 size-1.5 bg-accent shadow-[0_0_12px_var(--accent)]" />
        </div>
      </div>
      <div
        data-core
        className="relative size-32 [transform-style:preserve-3d] [transform:rotateX(-20deg)_rotateY(35deg)]"
      >
        {faces.map((face, index) => (
          <div
            key={face}
            className={
              "absolute inset-0 flex items-center justify-center border border-accent/50 bg-background/80 [backface-visibility:visible] " +
              face
            }
          >
            <div className="absolute inset-2 border border-accent/10" />
            <div className="absolute inset-x-0 top-1/3 border-t border-accent/10" />
            <div className="absolute inset-x-0 top-2/3 border-t border-accent/10" />
            <div className="absolute inset-y-0 left-1/3 border-l border-accent/10" />
            <div className="absolute inset-y-0 left-2/3 border-l border-accent/10" />
            <CodeXml className="size-11 text-accent" strokeWidth={1} />
            <span className="absolute bottom-2 left-3 font-mono text-[7px] tracking-widest text-text-faint">
              BUILD.CORE / 0{index + 1}
            </span>
            <span
              data-core-node
              className="absolute top-2 right-2 size-1 bg-accent"
            />
          </div>
        ))}
      </div>
      <span className="absolute top-6 left-0 font-mono text-[8px] tracking-widest text-text-faint">
        [ CORE ONLINE ]
      </span>
      <span className="absolute right-0 bottom-7 font-mono text-[8px] tracking-widest text-text-faint">
        X:01 Y:01 Z:01
      </span>
    </div>
  )
}
function tiltCard(event: PointerEvent<HTMLElement>) {
  if (
    event.pointerType !== "mouse" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return
  const bounds = event.currentTarget.getBoundingClientRect()
  gsap.to(event.currentTarget, {
    rotationY: ((event.clientX - bounds.left) / bounds.width - 0.5) * 10,
    rotationX: -((event.clientY - bounds.top) / bounds.height - 0.5) * 10,
    transformPerspective: 1000,
    duration: 0.4,
    overwrite: "auto",
    ease: "power2.out",
  })
}

function resetCard(event: PointerEvent<HTMLElement>) {
  gsap.to(event.currentTarget, {
    rotationX: 0,
    rotationY: 0,
    duration: 0.6,
    overwrite: "auto",
    ease: "power2.out",
  })
}

function Ambient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="ambient-grid absolute -inset-16 opacity-20" />
      <div className="absolute inset-x-[-40%] bottom-[-38%] h-[70%] [perspective:600px]">
        <div className="ambient-grid size-full origin-top opacity-60 [transform:rotateX(65deg)]" />
      </div>
      <div className="ambient-glow absolute inset-x-0 top-[5%] h-[85%] opacity-[0.075]" />
    </div>
  )
}

const buttonClass =
  "inline-flex items-center justify-center gap-3 rounded-sm bg-accent px-5 py-3 font-mono text-xs font-semibold text-background transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_var(--accent)] focus-visible:outline-accent motion-reduce:transform-none"

function Welcome() {
  const page = useRef<HTMLDivElement>(null)
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    document.title = "Welcome to build.it"
    document.documentElement.lang = "en"
    const onScroll = () => setLifted(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const scope = createScope({
      root: page,
      mediaQueries: { reduced: "(prefers-reduced-motion: reduce)" },
    })
    scope.add(() => {
      if (scope.matches.reduced) return

      createTimeline({ defaults: { ease: "out(3)" } })
        .add(
          "[data-hero-chip]",
          { opacity: [0, 1], translateY: [10, 0], duration: 550 },
          0,
        )
        .add(
          "[data-hero-letter]",
          {
            opacity: [0, 1],
            translateY: [18, 0],
            rotateX: [-45, 0],
            delay: stagger(24),
            duration: 700,
          },
          180,
        )
        .add(
          "[data-hero-description]",
          { opacity: [0, 1], translateY: [12, 0], duration: 700 },
          700,
        )

      const loops = [
        animate("[data-core]", {
          rotateY: [35, 395],
          rotateX: -20,
          duration: 24000,
          loop: true,
          ease: "linear",
        }),
        animate("[data-core]", {
          translateY: [0, -12],
          duration: 2800,
          alternate: true,
          loop: true,
          ease: "inOutSine",
        }),
        animate("[data-core-orbit]", {
          rotateZ: [0, 360],
          duration: 12000,
          loop: true,
          ease: "linear",
        }),
        animate("[data-core-shadow]", {
          scale: [1, 0.8],
          opacity: [1, 0.5],
          duration: 2800,
          alternate: true,
          loop: true,
          ease: "inOutSine",
        }),
        animate("[data-core-node]", {
          opacity: [0.25, 1],
          duration: 1000,
          delay: stagger(140),
          alternate: true,
          loop: true,
          ease: "inOutSine",
        }),
      ]
      const observer = new IntersectionObserver((entries) => {
        loops.forEach((animation) =>
          entries[0].isIntersecting ? animation.resume() : animation.pause(),
        )
      })
      const core = page.current?.querySelector("[data-core]")
      if (core) observer.observe(core)

      const listeners: Array<() => void> = []
      page.current
        ?.querySelectorAll<HTMLElement>("[data-anime-cta]")
        .forEach((button) => {
          const arrow = button.querySelector("svg")
          const enter = () =>
            scope.execute(() => {
              animate(button, { scale: 1.025, duration: 450, ease: "outBack" })
              if (arrow)
                animate(arrow, {
                  translateX: 5,
                  duration: 450,
                  ease: "outBack",
                })
            })
          const leave = () =>
            scope.execute(() => {
              animate(button, { scale: 1, duration: 350, ease: "out(3)" })
              if (arrow)
                animate(arrow, { translateX: 0, duration: 350, ease: "out(3)" })
            })
          button.addEventListener("pointerenter", enter)
          button.addEventListener("pointerleave", leave)
          button.addEventListener("focus", enter)
          button.addEventListener("blur", leave)
          listeners.push(() => {
            button.removeEventListener("pointerenter", enter)
            button.removeEventListener("pointerleave", leave)
            button.removeEventListener("focus", enter)
            button.removeEventListener("blur", leave)
          })
        })
      return () => {
        observer.disconnect()
        listeners.forEach((remove) => remove())
      }
    })
    return () => scope.revert()
  }, [])

  useEffect(() => {
    const media = gsap.matchMedia()
    media.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const reduced = context.conditions?.reduced
        gsap.utils
          .toArray<HTMLElement>("[data-reveal-grid]", page.current!)
          .forEach((grid) => {
            gsap.fromTo(
              grid.querySelectorAll("[data-reveal]"),
              {
                opacity: 0,
                y: reduced ? 0 : 35,
                rotationX: reduced ? 0 : 12,
                transformPerspective: 1000,
              },
              {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: reduced ? 0 : 0.65,
                stagger: reduced ? 0 : 0.15,
                ease: "power2.out",
                scrollTrigger: { trigger: grid, start: "top 88%", once: true },
              },
            )
          })
        if (!reduced)
          gsap.to("[data-scroll-chevron]", {
            y: 4,
            duration: 1.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
      },
      page,
    )
    return () => media.revert()
  }, [])

  return (
    <div
      ref={page}
      className="min-h-screen bg-background text-foreground antialiased"
    >
      <header
        className={`sticky top-0 z-50 h-20 border-b border-border transition-[background-color,backdrop-filter] duration-300 ${
          lifted ? "bg-background/95 backdrop-blur-xl" : "bg-background"
        }`}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-5 md:px-10"
        >
          <a
            href="/"
            aria-label="build.it home"
            className="flex items-center gap-2.5"
          >
            <Blocks className="size-7 text-accent" strokeWidth={1.8} />
            <span className="text-xl font-semibold">
              build<span className="text-accent">.</span>it
            </span>
            <span className="ml-2 hidden border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-faint sm:block">
              v1.0
            </span>
          </a>
          <div className="flex items-center gap-5 md:gap-7">
            <div className="hidden items-center gap-2.5 sm:flex">
              <span
                aria-label="Sample profile avatar"
                className="flex size-7 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs text-text-dim"
              >
                A
              </span>
              <span className="font-mono text-xs text-text-dim">@alex</span>
            </div>
            <a
              data-anime-cta
              href="/dashboard"
              className={`${buttonClass} px-3.5 py-2.5 sm:px-5`}
            >
              Go to Dashboard
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative flex min-h-[calc(100svh-80px)] items-center justify-center overflow-hidden px-6 pt-16 pb-32">
          <Ambient />
          <div className="relative mx-auto w-full max-w-[720px] text-center">
            <TechCore />
            <div
              data-hero-chip
              className="mb-8 inline-flex items-center gap-2 border border-accent/25 bg-background/60 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-accent sm:text-xs"
            >
              <span className="size-1.5 bg-accent" />[ SIGNED IN AS @alex ]
            </div>
            <h1
              aria-label="Welcome to build.it, Alex."
              className="font-mono text-[clamp(32px,4.5vw,58px)] leading-[1.22] font-normal tracking-[-0.03em] [perspective:800px]"
            >
              <span aria-hidden="true">
                {"Welcome to build.it,".split(" ").map((word, wordIndex) => (
                  <span key={wordIndex}>
                    {wordIndex > 0 && " "}
                    <span className="inline-block whitespace-nowrap">
                      {Array.from(word).map((letter, letterIndex) => (
                        <span
                          data-hero-letter
                          key={letterIndex}
                          className="inline-block"
                        >
                          {letter}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
              </span>
              <br />
              <span aria-hidden="true" className="text-accent">
                {Array.from("Alex").map((letter, index) => (
                  <span data-hero-letter key={index} className="inline-block">
                    {letter}
                  </span>
                ))}
                <span data-hero-letter className="inline-block text-foreground">
                  .
                </span>
              </span>
              <span
                aria-hidden="true"
                className="ml-2 inline-block h-[0.8em] w-[0.35em] animate-[cursor-blink_1.4s_steps(1)_infinite] bg-accent align-baseline motion-reduce:animate-none"
              />
            </h1>
            <p
              data-hero-description
              className="mx-auto mt-4 max-w-xl font-mono text-[clamp(13px,1vw,16px)] leading-7 font-light tracking-[0.1em] text-text-dim uppercase"
            >
              You're about to stop guessing
              <br className="hidden sm:block" /> what to build next.
            </p>
            <div className="mx-auto mt-10 flex items-center justify-center gap-3 font-mono text-[10px] tracking-wide text-text-faint">
              <span className="h-px w-6 bg-border" />
              <span>LESS GUESSWORK. MORE BUILDING.</span>
              <span className="h-px w-6 bg-border" />
            </div>
          </div>
          <a
            href="#how-it-works"
            className="absolute bottom-10 flex flex-col items-center gap-3 font-mono text-[10px] tracking-[0.14em] text-text-faint uppercase transition hover:text-accent"
          >
            Scroll to explore
            <ChevronDown data-scroll-chevron className="size-4" />
          </a>
          <span
            aria-hidden="true"
            className="absolute bottom-10 left-10 hidden font-mono text-[10px] text-text-faint md:block"
          >
            01 — THE BEGINNING
          </span>
          <span
            aria-hidden="true"
            className="absolute right-10 bottom-10 hidden font-mono text-[10px] text-text-faint md:block"
          >
            BUILT FOR BUILDERS.
          </span>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-20 border-t border-border px-6 py-24 md:px-10 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-text-faint">
                THE PROCESS / 01
              </p>
              <h2 className="font-mono text-[clamp(28px,3vw,42px)] font-medium">
                <span className="text-text-faint">// </span>How it works
              </h2>
              <p className="mx-auto mt-4 max-w-[560px] text-sm leading-7 text-text-dim">
                Three steps between you and a project worth putting on your
                resume.
              </p>
            </div>
            <div
              data-reveal-grid
              className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {steps.map((step, index) => (
                <article
                  data-reveal
                  onPointerMove={tiltCard}
                  onPointerLeave={resetCard}
                  key={step.title}
                  className="relative overflow-hidden rounded-lg border border-border bg-surface p-8 [transform-style:preserve-3d] transition-[background-color,box-shadow] duration-300 hover:bg-surface-muted hover:shadow-[0_20px_50px_-20px_var(--bg)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-5 right-6 font-mono text-5xl font-normal text-text-faint/30"
                  >
                    0{index + 1}
                  </span>
                  <step.icon
                    className="relative mb-9 size-7 text-accent"
                    strokeWidth={1.5}
                  />
                  <h3 className="relative mb-4 font-mono text-[16px] leading-7 font-semibold">
                    {step.title}
                  </h3>
                  <p className="relative text-sm leading-7 text-text-dim">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 font-mono text-[10px] text-text-faint">
              <Terminal className="size-3.5" />
              <span>From “what now?” to your next commit.</span>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-text-faint">
                THE TOOLKIT / 02
              </p>
              <h2 className="font-mono text-[clamp(28px,3vw,42px)] font-medium">
                <span className="text-text-faint">// </span>What you get
              </h2>
            </div>
            <div
              data-reveal-grid
              className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              {features.map((feature) => (
                <article
                  data-reveal
                  onPointerMove={tiltCard}
                  onPointerLeave={resetCard}
                  key={feature.title}
                  className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-8 [transform-style:preserve-3d] transition-[background-color,box-shadow] duration-300 hover:bg-surface-muted hover:shadow-[0_20px_50px_-20px_var(--bg)] sm:flex-row sm:gap-6"
                >
                  <feature.icon
                    className="size-7 shrink-0 text-accent"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h3 className="mb-3 font-mono text-[16px] font-semibold">
                      {feature.title}
                    </h3>
                    <p className="max-w-md text-sm leading-7 text-text-dim">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-border px-6 py-[clamp(80px,10vw,140px)] text-center">
          <Ambient />
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.12em] text-text-faint">
              <Check className="size-3.5 text-accent" /> YOU'RE IN. NOW MAKE IT
              COUNT.
            </div>
            <h2 className="font-mono text-[clamp(28px,3.5vw,48px)] leading-[1.3] font-light">
              Ready to find out what
              <br className="hidden sm:block" /> you should build next?
            </h2>
            <a
              data-anime-cta
              href="/generate"
              className={`${buttonClass} mt-9 min-h-14 px-7 text-sm`}
            >
              Generate My First Roadmap
              <ArrowRight className="size-4" />
            </a>
            <div className="mt-5">
              <a
                href="/dashboard"
                className="font-mono text-xs text-text-dim underline-offset-4 hover:underline"
              >
                Or explore your dashboard first
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 font-mono text-[10px] text-text-dim sm:flex-row sm:gap-6">
          <span>
            © {new Date().getFullYear()} build.it. Built for what comes next.
          </span>
          <span className="hidden text-border sm:block">/</span>
          <div className="flex gap-5">
            <a href="/terms" className="hover:text-foreground">
              Terms
            </a>
            <a href="/privacy" className="hover:text-foreground">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DestinationUnavailable() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 text-foreground antialiased">
      <div className="max-w-lg text-center">
        <Blocks className="mx-auto mb-6 size-9 text-accent" />
        <h1 className="text-3xl font-light">
          This is the welcome-page preview.
        </h1>
        <p className="mt-5 text-sm leading-7 text-text-dim">
          The dashboard, roadmap generator, and legal pages need to be connected
          to the rest of your build.it application.
        </p>
        <a href="/welcome" className={`${buttonClass} mt-8`}>
          Back to welcome
          <ArrowRight className="size-4" />
        </a>
      </div>
    </main>
  )
}

const router = createBrowserRouter([
  { path: "/", Component: Welcome },
  { path: "/welcome", Component: Welcome },
  { path: "*", Component: DestinationUnavailable },
])

export default function App() {
  return <RouterProvider router={router} />
}
