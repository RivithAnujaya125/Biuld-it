import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { gsap } from 'gsap'
import { ArrowLeft, ArrowRight, Plus, Sparkles, X } from 'lucide-react'
import AppShell from './AppShell'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Progress } from './ui/progress'
import { PillGroup } from './ui/radio-group'
import { Textarea } from './ui/textarea'
import { isReducedMotion, triggerBounce } from '../lib/motion'

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const STRONGEST_AREAS = ['Frontend', 'Backend', 'Fullstack', 'Data', 'DevOps']
const GOAL_PRESETS = [
  'SE Internship', 'ML Role', 'Frontend Role', 'Backend Role',
  'Fullstack Role', 'DevOps/SRE Role', 'Open Source Contributor', 'Freelance',
]
const TIME_OPTIONS = ['A Weekend', '2 Weeks', 'A Month+']
const WEEKLY_HOURS_OPTIONS = ['2-4 hrs', '5-10 hrs', '10-20 hrs', '20+ hrs']
const GROWTH_FOCUS_OPTIONS = ['Backend Depth', 'Frontend Polish', 'System Design', 'DevOps & Deployment', 'AI Integration']
const PROJECT_PURPOSE_OPTIONS = ['Resume Bullet', 'Live Demo to Share', 'Open Source Contribution', 'Pure Learning']
const DOMAIN_OPTIONS = ['Fintech', 'Dev Tools', 'Healthtech', 'Gaming', 'No Preference']

// Default growth focus = deliberately NOT the current strength
// (Fullstack strength defaults to System Design as the stretch).
function defaultGrowthFocus(strongestArea) {
  switch (strongestArea) {
    case 'Frontend':
      return 'Backend Depth'
    case 'Backend':
      return 'Frontend Polish'
    case 'Fullstack':
      return 'System Design'
    case 'Data':
      return 'AI Integration'
    case 'DevOps':
      return 'System Design'
    default:
      return 'Backend Depth'
  }
}

const STEPS = [
  { id: 0, title: 'About you', hint: 'STEP 1 / 5' },
  { id: 1, title: "Where you're headed", hint: 'STEP 2 / 5' },
  { id: 2, title: 'Constraints', hint: 'STEP 3 / 5' },
  { id: 3, title: 'Your stack', hint: 'STEP 4 / 5' },
  { id: 4, title: 'Review & generate', hint: 'STEP 5 / 5' },
]

/* ── Individual animated tag chip ────────────────────────────────────── */
function TagChip({ tag, onRemove }) {
  const chipRef = useRef(null)
  const isRemovingRef = useRef(false)

  useEffect(() => {
    if (isReducedMotion() || !chipRef.current) return
    animate(chipRef.current, {
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 200,
      ease: 'outQuad',
    })
  }, [])

  const handleRemove = (e) => {
    e.stopPropagation()
    if (isRemovingRef.current) return
    if (isReducedMotion() || !chipRef.current) {
      onRemove(tag)
      return
    }
    isRemovingRef.current = true
    animate(chipRef.current, {
      scale: [1, 0.8],
      opacity: [1, 0],
      duration: 150,
      ease: 'inQuad',
    })
    setTimeout(() => {
      onRemove(tag)
    }, 150)
  }

  return (
    <div
      ref={chipRef}
      className="bg-accent/10 border border-accent rounded-md px-2 py-1 flex items-center gap-1 origin-center"
    >
      <span className="font-mono text-[11px] text-accent">{tag}</span>
      <button
        type="button"
        onClick={handleRemove}
        className="hover:opacity-75 transition-opacity"
      >
        <X size={10} className="text-accent" />
      </button>
    </div>
  )
}

/* ── Reusable tag-input group (same chip style as the original) ──────── */
function TagGroup({ label, tags, onAdd, onRemove }) {
  const [value, setValue] = useState('')
  const add = () => {
    const tag = value.trim()
    if (tag && !tags.includes(tag)) onAdd(tag)
    setValue('')
  }
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-mono text-textFaint">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <TagChip key={tag} tag={tag} onRemove={onRemove} />
        ))}
        <div className="border border-dashed border-[#3f3f46] rounded-md px-2 py-1 flex items-center gap-1">
          <Plus size={8} className="text-textFaint" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add"
            className="bg-transparent text-[11px] font-mono text-textFaint placeholder-textFaint outline-none w-10"
          />
        </div>
      </div>
    </div>
  )
}

/* ── Main form: 5-step survey wizard ─────────────────────────────────── */
export default function InputForm({ onGenerate, onOpenDashboard, onBackToHero }) {
  // ── state (same combined shape sent to onGenerate as before) ──
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [stepError, setStepError] = useState('')
  const [skillLevel, setSkillLevel] = useState('Intermediate')
  const [strongestArea, setStrongestArea] = useState('Frontend')
  const [growthFocus, setGrowthFocus] = useState(() => defaultGrowthFocus('Frontend'))
  const [growthTouched, setGrowthTouched] = useState(false)
  const [stack, setStack] = useState({
    languages: ['JavaScript', 'TypeScript'],
    frameworks: ['React', 'Node.js'],
    databases: [],
    cloud: [],
  })
  const [goal, setGoal] = useState('Frontend Role')
  const [customGoal, setCustomGoal] = useState('')
  const [projectPurpose, setProjectPurpose] = useState('Resume Bullet')
  const [timeFrame, setTimeFrame] = useState('2 Weeks')
  const [weeklyHours, setWeeklyHours] = useState('5-10 hrs')
  const [domainInterest, setDomainInterest] = useState('No Preference')
  const [constraints, setConstraints] = useState({ openSource: true, noCrud: true })
  const [priorProjects, setPriorProjects] = useState('')
  const cardRef = useRef(null)
  const stepBodyRef = useRef(null)

  // ── Entrance animation: Card fades in immediately, children stagger right after ──
  useEffect(() => {
    if (isReducedMotion()) {
      if (cardRef.current) {
        cardRef.current.style.opacity = '1'
        cardRef.current.style.transform = 'none'
      }
      return
    }

    // 1. Card fades in immediately
    animate(cardRef.current, {
      opacity: [0, 1],
      y: [16, 0],
      duration: 500,
      ease: 'outQuad',
    })

    // 2. Wizard chrome staggers in right after
    const chrome = cardRef.current?.querySelectorAll('.wizard-chrome')
    if (chrome && chrome.length > 0) {
      gsap.fromTo(
        chrome,
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
  }, [])

  // ── Step transition: slide + fade via GSAP, direction-aware ──
  useEffect(() => {
    const el = stepBodyRef.current
    if (!el) return
    if (isReducedMotion()) {
      gsap.set(el, { opacity: 1, x: 0 })
      return
    }
    // incoming step slides in from the side we came from
    gsap.fromTo(
      el,
      { opacity: 0, x: 24 * direction },
      { opacity: 1, x: 0, duration: 0.25, delay: 0.06, ease: 'power2.out', overwrite: 'auto' }
    )
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const goToStep = (next, dir) => {
    if (next === step) return
    const el = stepBodyRef.current
    if (!el || isReducedMotion()) {
      setDirection(dir ?? (next > step ? 1 : -1))
      setStepError('')
      setStep(next)
      return
    }
    // outgoing step slides out first (200ms), then swap
    gsap.to(el, {
      opacity: 0,
      x: -24 * (dir ?? (next > step ? 1 : -1)),
      duration: 0.2,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        setDirection(dir ?? (next > step ? 1 : -1))
        setStepError('')
        setStep(next)
      },
    })
  }

  const handleNext = () => {
    // Guard steps 1-2 (both default to a preset, so this rarely triggers)
    if (step === 0 && !skillLevel) {
      setStepError('Pick an experience level to continue.')
      return
    }
    if (step === 1 && !(customGoal.trim() || goal)) {
      setStepError('Pick or type a target career goal to continue.')
      return
    }
    if (step < STEPS.length - 1) goToStep(step + 1, 1)
  }

  const handleBack = () => {
    if (step > 0) goToStep(step - 1, -1)
  }

  const handleSkipToReview = () => goToStep(STEPS.length - 1, 1)

  // ── stack helpers ──
  const addToStack = (group, tag) =>
    setStack((s) => ({ ...s, [group]: [...s[group], tag] }))
  const removeFromStack = (group, tag) =>
    setStack((s) => ({ ...s, [group]: s[group].filter((t) => t !== tag) }))

  // ── submit (same payload shape as before, plus 3 additive fields) ──
  const handleSubmit = (e) => {
    triggerBounce(e.currentTarget)
    onGenerate({
      skillLevel,
      strongestArea,
      growthFocus,
      stack,
      goal: customGoal.trim() || goal,
      projectPurpose,
      timeFrame,
      weeklyHours,
      domainInterest,
      constraints,
      priorProjects: priorProjects.trim(),
    })
  }

  const stackCount =
    stack.languages.length + stack.frameworks.length + stack.databases.length + stack.cloud.length

  return (
    <AppShell onOpenDashboard={onOpenDashboard}>
      <div
        ref={cardRef}
        style={{ opacity: 0 }}
        className="bg-surface border border-border rounded-lg p-8 w-full max-w-[760px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col gap-7"
      >
        {/* ── Header + wizard progress (shadcn Progress, cyan primary) ── */}
        <div className="wizard-chrome flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-textPrimary">What should you build next?</h1>
              <p className="text-sm text-textMuted">Tell us your skills and career targets.</p>
            </div>
            {onBackToHero && (
              <button type="button" onClick={onBackToHero} className="shrink-0 font-mono text-[11px] text-textFaint hover:text-textMuted transition-colors cursor-pointer">← Home</button>
            )}
          </div>
        </div>
        <div className="wizard-chrome flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-textFaint">{STEPS[step].hint}</span>
            <span className="text-[11px] font-mono text-textMuted">{STEPS[step].title} · {step + 1} of {STEPS.length}</span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} aria-label={`Step ${step + 1} of ${STEPS.length}`} />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((s) => (
                <span key={s.id} className={`h-1 w-6 rounded-full ${s.id <= step ? 'bg-accent' : 'bg-border'}`} />
              ))}
            </div>
            {step === 0 && (
              <button type="button" onClick={handleSkipToReview} className="font-mono text-[11px] text-textFaint hover:text-accent transition-colors cursor-pointer">skip to review →</button>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* ── Step body (GSAP slide/fade target) ── */}
        <div ref={stepBodyRef} className="flex flex-col gap-6 min-h-[280px]">
          {step === 0 && (
            <>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">Experience Level</label>
                <PillGroup name="skillLevel" ariaLabel="Experience level" value={skillLevel} onChange={setSkillLevel} options={SKILL_LEVELS} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">Strongest Area</label>
                <PillGroup
                  name="strongestArea"
                  ariaLabel="Strongest area"
                  value={strongestArea}
                  onChange={(next) => {
                    setStrongestArea(next)
                    // Keep growth focus deliberately different unless the user
                    // has explicitly picked their own stretch area.
                    if (!growthTouched) setGrowthFocus(defaultGrowthFocus(next))
                  }}
                  options={STRONGEST_AREAS}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">What do you want to get better at?</label>
                <PillGroup
                  name="growthFocus"
                  ariaLabel="Growth focus"
                  value={growthFocus}
                  onChange={(next) => {
                    setGrowthFocus(next)
                    setGrowthTouched(true)
                  }}
                  options={GROWTH_FOCUS_OPTIONS}
                />
                <p className="font-mono text-[11px] text-textFaint">
                  Stretch pick — at least one milestone will touch this, even outside your comfort zone.
                </p>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">Target Career Goal</label>
                <div className="flex flex-wrap gap-2.5">
                  {GOAL_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={(e) => { triggerBounce(e.currentTarget); setGoal(preset); setCustomGoal('') }}
                      className={`text-[13px] font-mono px-4 py-2 rounded-md border transition cursor-pointer ${goal === preset && !customGoal ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surfaceMuted text-textMuted hover:border-textFaint'}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <Input value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} placeholder="Or type your own goal…" />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">What&apos;s this project actually for?</label>
                <PillGroup name="projectPurpose" ariaLabel="Project purpose" value={projectPurpose} onChange={setProjectPurpose} options={PROJECT_PURPOSE_OPTIONS} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">Domain Interest</label>
                <PillGroup name="domainInterest" ariaLabel="Domain interest" value={domainInterest} onChange={setDomainInterest} options={DOMAIN_OPTIONS} />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">Time Frame Allocation</label>
                <PillGroup name="timeFrame" ariaLabel="Time frame" value={timeFrame} onChange={setTimeFrame} options={TIME_OPTIONS} />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">Hours available per week</label>
                <PillGroup name="weeklyHours" ariaLabel="Weekly hours" value={weeklyHours} onChange={setWeeklyHours} options={WEEKLY_HOURS_OPTIONS} />
                <p className="font-mono text-[11px] text-textFaint">
                  Real scoping constraint — calendar time × weekly hours sets the true budget.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase text-textMuted">Constraints</label>
                <label className="flex items-center gap-3 cursor-pointer bg-surfaceMuted border border-border rounded-md px-3 py-2.5">
                  <Checkbox checked={constraints.openSource} onCheckedChange={(v) => setConstraints((c) => ({ ...c, openSource: v === true }))} aria-label="Prefer open-source or free-tier tools" />
                  <span className="text-[13px] text-textMuted">Prefer open-source or free-tier tools/apps</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-surfaceMuted border border-border rounded-md px-3 py-2.5">
                  <Checkbox checked={constraints.noCrud} onCheckedChange={(v) => setConstraints((c) => ({ ...c, noCrud: v === true }))} aria-label="Avoid another CRUD app" />
                  <span className="text-[13px] text-textMuted">Avoid another CRUD app</span>
                </label>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-textMuted">Tech Stack / Skills</label>
                <span className="text-[11px] font-mono text-textFaint">grouped · removable · {stackCount} selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TagGroup label="Languages" tags={stack.languages} onAdd={(tag) => addToStack('languages', tag)} onRemove={(tag) => removeFromStack('languages', tag)} />
                <TagGroup label="Frameworks" tags={stack.frameworks} onAdd={(tag) => addToStack('frameworks', tag)} onRemove={(tag) => removeFromStack('frameworks', tag)} />
                <TagGroup label="Databases" tags={stack.databases} onAdd={(tag) => addToStack('databases', tag)} onRemove={(tag) => removeFromStack('databases', tag)} />
                <TagGroup label="Cloud & DevOps" tags={stack.cloud} onAdd={(tag) => addToStack('cloud', tag)} onRemove={(tag) => removeFromStack('cloud', tag)} />
              </div>
            </div>
          )}
          {step === 4 && (
            <>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase text-textMuted">Review your answers</label>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                  {[
                    ['Experience', skillLevel],
                    ['Strongest area', strongestArea],
                    ['Growth focus', growthFocus],
                    ['Career goal', customGoal.trim() || goal],
                    ['Project purpose', projectPurpose],
                    ['Domain', domainInterest],
                    ['Time frame', timeFrame],
                    ['Weekly hours', weeklyHours],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-surfaceMuted border border-border rounded-md px-3 py-2.5">
                      <dt className="font-mono text-[11px] text-textFaint uppercase">{k}</dt>
                      <dd className="text-textMuted mt-1 leading-6">{v}</dd>
                    </div>
                  ))}
                  <div className="bg-surfaceMuted border border-border rounded-md px-3 py-2.5 sm:col-span-2">
                    <dt className="font-mono text-[11px] text-textFaint uppercase">Stack ({stackCount})</dt>
                    <dd className="text-textMuted mt-1 leading-6">
                      {stackCount > 0
                        ? [...stack.languages, ...stack.frameworks, ...stack.databases, ...stack.cloud].join(' · ')
                        : 'None added yet'}
                    </dd>
                  </div>
                </dl>
                <p className="font-mono text-[11px] text-textFaint">
                  Constraints: {constraints.openSource ? 'open-source preferred' : 'any tooling'} · {constraints.noCrud ? 'no CRUD apps' : 'CRUD ok'}
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase text-textMuted">What have you already built?</label>
                  <span className="text-[11px] font-mono text-textFaint">optional</span>
                </div>
                <Textarea value={priorProjects} onChange={(e) => setPriorProjects(e.target.value)} placeholder="e.g. a portfolio site, a to-do app with auth…" rows={3} />
              </div>
            </>
          )}
          {stepError && (
            <p role="alert" className="font-mono text-xs text-red-400">{stepError}</p>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* ── Wizard nav (shadcn Button) ── */}
        <div className="wizard-chrome flex items-center justify-between gap-3">
          <div>
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={handleBack} className="text-textMuted">
                <ArrowLeft size={14} /> Back
              </Button>
            ) : (
              <span className="font-mono text-[11px] text-textFaint">Power user? Use skip to review.</span>
            )}
          </div>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext} className="bg-accent text-bg font-bold hover:opacity-90">
              Next <ArrowRight size={14} />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} className="bg-accent text-bg font-bold hover:opacity-90">
              <Sparkles size={14} /> Generate My Project
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  )
}

