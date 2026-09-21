import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Plus, X } from 'lucide-react'
import AppShell from './AppShell'

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const GOAL_PRESETS = ['SE Internship', 'ML Role', 'Frontend Role', 'Freelance']
const TIME_OPTIONS = ['A Weekend', '2 Weeks', 'A Month+']

export default function InputForm({ onGenerate }) {
  const [skillLevel, setSkillLevel] = useState('Intermediate')
  const [stack, setStack] = useState(['React', 'Node.js', 'TypeScript'])
  const [newTag, setNewTag] = useState('')
  const [goal, setGoal] = useState('Frontend Role')
  const [customGoal, setCustomGoal] = useState('')
  const [timeFrame, setTimeFrame] = useState('2 Weeks')
  const cardRef = useRef(null)

  useEffect(() => {
    animate(cardRef.current, {
      opacity: [0, 1],
      y: [16, 0],
      duration: 500,
      ease: 'outQuad',
    })
  }, [])

  const addTag = () => {
    const tag = newTag.trim()
    if (tag && !stack.includes(tag)) setStack([...stack, tag])
    setNewTag('')
  }

  const removeTag = (tag) => setStack(stack.filter((t) => t !== tag))

  const handleSubmit = () => {
    onGenerate({
      skillLevel,
      stack,
      goal: customGoal.trim() || goal,
      timeFrame,
    })
  }

  return (
    <AppShell statusLabel="GenAI Scoper Active" subLabel="Configuration Panel">
      <div
        ref={cardRef}
        style={{ opacity: 0 }}
        className="bg-surface border border-border rounded-lg p-8 w-[540px] shadow-[0_8px_12px_rgba(0,0,0,0.5)] flex flex-col gap-7"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-textPrimary">What should you build next?</h1>
          <p className="text-sm text-textMuted">
            Tell us your skills and career targets, and we'll engineer a tailored, structured roadmap.
          </p>
        </div>
        <div className="h-px bg-border" />

        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold uppercase text-textMuted">My Skill Level</label>
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

        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-textMuted">Tech Stack / Skills</label>
            <span className="text-[11px] font-mono text-textFaint">removable</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stack.map((tag) => (
              <div
                key={tag}
                className="bg-accent/10 border border-accent rounded-md px-2.5 py-1.5 flex items-center gap-1.5"
              >
                <span className="font-mono text-xs text-accent">{tag}</span>
                <button type="button" onClick={() => removeTag(tag)}>
                  <X size={12} className="text-accent" />
                </button>
              </div>
            ))}
            <div className="border border-dashed border-[#3f3f46] rounded-md px-2.5 py-1.5 flex items-center gap-1">
              <Plus size={10} className="text-textFaint" />
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add Tag"
                className="bg-transparent text-xs font-mono text-textFaint placeholder-textFaint outline-none w-16"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <label className="text-xs font-semibold uppercase text-textMuted">Target Career Goal</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGoal(g)
                  setCustomGoal('')
                }}
                className={`px-3 py-2 rounded-md text-[13px] font-medium border ${
                  goal === g && !customGoal
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'border-border text-textMuted'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <input
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder='Or type custom: "Junior Fullstack Engineer at Linear"'
            className="bg-surfaceMuted border border-border rounded-md h-[42px] px-3 text-[13px] text-textMuted outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <label className="text-xs font-semibold uppercase text-textMuted">Time Frame Allocation</label>
          <div className="flex gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeFrame(t)}
                className={`flex-1 py-2.5 rounded-md text-[13px] border ${
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
