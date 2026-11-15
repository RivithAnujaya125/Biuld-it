import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'

import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'
import { Separator } from './separator'

const initialRows = [
  { key: 'name', label: 'Full name', value: 'Ada Lovelace' },
  { key: 'email', label: 'Email', value: 'ada@acme.com' },
  { key: 'phone', label: 'Phone', value: '+1 555 0142' },
]

export function Settings3({ rows: externalRows, onSave }) {
  const [rows, setRows] = useState(externalRows || initialRows)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')

  function startEdit(row) {
    setEditing(row.key)
    setDraft(row.value)
  }

  function save(key) {
    const updated = rows.map((r) => (r.key === key ? { ...r, value: draft } : r))
    setRows(updated)
    setEditing(null)
    if (onSave) onSave(updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal info</CardTitle>
        <p className="text-muted-foreground text-sm">
          Edit one field at a time, in place.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col">
        {rows.map((row, i) => (
          <div key={row.key}>
            {i > 0 && <Separator />}
            <div className="flex items-center justify-between gap-4 py-3">
              {editing === row.key ? (
                <>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor={`ie-${row.key}`} className="text-xs">
                      {row.label}
                    </Label>
                    <Input
                      id={`ie-${row.key}`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="mt-5 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditing(null)}
                      aria-label="Cancel"
                    >
                      <X className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => save(row.key)}
                      aria-label="Save"
                    >
                      <Check className="size-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-muted-foreground text-xs">
                      {row.label}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {row.value}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(row)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Settings3
