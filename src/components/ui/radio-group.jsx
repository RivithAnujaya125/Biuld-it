import * as React from 'react'
import { triggerBounce } from '../../lib/motion'
import { cn } from '../../lib/utils'

/**
 * Pill-style single-select group — same segmented, bordered,
 * accent-highlighted aesthetic as the rest of the form (NOT shadcn's
 * default radio-dot style). Accessible via radiogroup + aria-checked.
 */
function PillGroup({ value, onChange, options, ariaLabel, name }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={(e) => {
              onChange(option)
              triggerBounce(e.currentTarget)
            }}
            className={cn(
              'bg-bg text-[13px] font-mono px-5 py-2.5 rounded-md border transition cursor-pointer',
              selected
                ? 'border-accent text-accent'
                : 'border-border text-textMuted'
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export { PillGroup }