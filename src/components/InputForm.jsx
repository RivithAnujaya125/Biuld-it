import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Plus, X } from 'lucide-react'
import AppShell from './AppShell'

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const STRONGEST_AREAS = ['Frontend', 'Backend', 'Fullstack', 'Data', 'DevOps']
const GOAL_PRESETS = [
  'SE Internship', 'ML Role', 'Frontend Role', 'Backend Role',
  'Fullstack Role', 'DevOps/SRE Role', 'Open Source Contributor', 'Freelance',
]
const TIME_OPTIONS = ['A Weekend', '2 Weeks', 'A Month+']
const DOMAIN_OPTIONS = ['Fintech', 'Dev Tools', 'Healthtech', 'Gaming', 'No Preference']

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
          <div
            key={tag}
            className="bg-accent/10 border border-accent rounded-md px-2 py-1 flex items-center gap-1"
          >
            <span className="font-mono text-[11px] text-accent">{tag}</span>
            <button type="button" onClick={() => onRemove(tag)}>
              <X size={10} className="text-accent" />
            </button>
          </div>
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

/* ── Main form ───────────────────────────────────────────────────────── */
export default function InputForm({ onGenerate }) {
  // ── state ──
  const [skillLevel, setSkillLevel] = useState('Intermediate')
  const [strongestArea, setStrongestArea] = useState('Frontend')
  const [stack, setStack] = useState({
    languages: ['JavaScript', 'TypeScript'],
    frameworks: ['React', 'Node.js'],
    databases: [],
    cloud: [],
  })
  const [goal, setGoal] = useState('Frontend Role')
  const [customGoal, setCustomGoal] = useState('')
  const [timeFrame, setTimeFrame] = useState('2 Weeks')
  const [domainInterest, setDomainInterest] = useState('No Preference')
  const [constraints, setConstraints] = useState({ openSource: true, noCrud: true })
  const [priorProjects, setPriorProjects] = useState('')
  const cardRef = useRef(null)

  // ── entrance animation (anime.js v4) ──
  useEffect(() => {
    animate(cardRef.current, {
      opacity: [0, 1],
      y: [16, 0],
      duration: 500,
      ease: 'outQuad',
    })
  }, [])

  // ── stack helpers ──
  const addToStack = (group, tag) =>
    setStack((s) => ({ ...s, [group]: [...s[group], tag] }))
  const removeFromStack = (group, tag) =>
    setStack((s) => ({ ...s, [group]: s[group].filter((t) => t !== tag) }))

  // ── submit ──
  const handleSubmit = () => {
    onGenerate({
      skillLevel,
      strongestArea,
      stack,
      goal: customGoal.trim() || goal,
      timeFrame,
      domainInterest,
      constraints,
      priorProjects: priorProjects.trim(),
    })
  }

  return (
    <AppShell statusLabel="GenAI Scoper Active" subLabel="Configuration Panel">
      <div
        ref={cardRef}
        style={{ opacity: 0 }}
        className="bg-surface border border-border rounded-lg p-8 w-full max-w-[760px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col gap-7"
      >
        {/* ── Header ── */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-textPrimary">What should you build next?</h1>
          <p className="text-sm text-textMuted">
            Tell us your skills and career targets, and we'll engineer a tailored, structured roadmap.
          </p>
        </div>
        <div className="h-px bg-border" />

        {/* ── Two-column grid (single column < 640 px) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Experience Level */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold uppercase text-textMuted">Experience Level</label>
            <div className="bg-surfaceMuted border border-border rounded-md p-1 flex">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`flex-1 py-2 rounded text-[13px] font-medium transition ${
                    skillLevel === level
                      ? 'bg-border text-textPrimary font-semibold'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Strongest Area */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold uppercase text-textMuted">Strongest Area</label>
            <div className="flex flex-wrap gap-1.5">
              {STRONGEST_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setStrongestArea(area)}
                  className={`px-2.5 py-2 rounded-md text-[13px] font-medium border transition ${
                    strongestArea === area
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'border-border text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Target Career Goal */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold uppercase text-textMuted">Target Career Goal</label>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_PRESETS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => { setGoal(g); setCustomGoal('') }}
                  className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium border transition ${
                    goal === g && !customGoal
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'border-border text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder='Or type custom goal…'
              className="bg-surfaceMuted border border-border rounded-md h-[38px] px-3 text-[13px] text-textMuted outline-none focus:border-accent"
            />
          </div>

          {/* Domain Interest */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold uppercase text-textMuted">Domain Interest</label>
            <div className="flex flex-wrap gap-1.5">
              {DOMAIN_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDomainInterest(d)}
                  className={`px-2.5 py-2 rounded-md text-[13px] font-medium border transition ${
                    domainInterest === d
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'border-border text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Time Frame — full width ── */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold uppercase text-textMuted">Time Frame Allocation</label>
          <div className="flex gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeFrame(t)}
                className={`flex-1 py-2.5 rounded-md text-[13px] border transition ${
                  timeFrame === t
                    ? 'bg-accent/10 border-accent text-accent font-semibold'
                    : 'border-border text-textMuted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Constraints — compact checkbox row ── */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold uppercase text-textMuted">Constraints</label>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={constraints.openSource}
                onChange={(e) => setConstraints((c) => ({ ...c, openSource: e.target.checked }))}
                className="peer sr-only"
              />
              <span className="w-4 h-4 rounded border border-border bg-surfaceMuted flex items-center justify-center shrink-0 peer-checked:bg-accent/20 peer-checked:border-accent transition">
                {constraints.openSource && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </span>
              <span className="text-[13px] text-textMuted">Must be open source</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={constraints.noCrud}
                onChange={(e) => setConstraints((c) => ({ ...c, noCrud: e.target.checked }))}
                className="peer sr-only"
              />
              <span className="w-4 h-4 rounded border border-border bg-surfaceMuted flex items-center justify-center shrink-0 peer-checked:bg-accent/20 peer-checked:border-accent transition">
                {constraints.noCrud && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </span>
              <span className="text-[13px] text-textMuted">Avoid another CRUD app</span>
            </label>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* ── Tech Stack — 4 sub-groups, full width ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-textMuted">Tech Stack / Skills</label>
            <span className="text-[11px] font-mono text-textFaint">grouped · removable</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TagGroup
              label="Languages"
              tags={stack.languages}
              onAdd={(tag) => addToStack('languages', tag)}
              onRemove={(tag) => removeFromStack('languages', tag)}
            />
            <TagGroup
              label="Frameworks"
              tags={stack.frameworks}
              onAdd={(tag) => addToStack('frameworks', tag)}
              onRemove={(tag) => removeFromStack('frameworks', tag)}
            />
            <TagGroup
              label="Databases"
              tags={stack.databases}
              onAdd={(tag) => addToStack('databases', tag)}
              onRemove={(tag) => removeFromStack('databases', tag)}
            />
            <TagGroup
              label="Cloud & DevOps"
              tags={stack.cloud}
              onAdd={(tag) => addToStack('cloud', tag)}
              onRemove={(tag) => removeFromStack('cloud', tag)}
            />
          </div>
        </div>

        {/* ── What have you already built? — optional ── */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-textMuted">What have you already built?</label>
            <span className="text-[11px] font-mono text-textFaint">optional</span>
          </div>
          <textarea
            value={priorProjects}
            onChange={(e) => setPriorProjects(e.target.value)}
            placeholder="e.g. a portfolio site, a to-do app with auth…"
            rows={3}
            className="bg-surfaceMuted border border-border rounded-md px-3 py-2.5 text-[13px] text-textMuted placeholder-textFaint outline-none focus:border-accent resize-none"
          />
        </div>

        {/* ── Submit ── */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-accent text-bg font-bold py-3.5 rounded-md hover:opacity-90 transition"
        >
          Generate My Project
        </button>
      </div>
    </AppShell>
  )
}
