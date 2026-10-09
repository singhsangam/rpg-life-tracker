import { useEffect, useState } from 'react'
import { formatMinShort } from '../lib/time'
import type { BlockCategory, TimeBlock } from '../types'

const CATEGORIES: BlockCategory[] = [
  'sleep',
  'workout',
  'reading',
  'fresh',
  'office',
  'lunch',
  'relax',
  'music',
  'walk',
  'dinner',
  'free',
  'custom',
]

type Props = {
  block: TimeBlock | null
  open: boolean
  onClose: () => void
  onSave: (block: TimeBlock) => void
  onDelete?: () => void
}

export function EditBlockModal({ block, open, onClose, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<TimeBlock | null>(block)

  useEffect(() => {
    setDraft(block)
  }, [block])

  if (!open || !draft) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-block-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <h3 id="edit-block-title">Edit time block</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <label>
          Label
          <input
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
        </label>

        <div className="form-row">
          <label>
            Start
            <input
              type="time"
              value={formatMinShort(draft.startMin)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number)
                setDraft({ ...draft, startMin: h * 60 + m })
              }}
            />
          </label>
          <label>
            End
            <input
              type="time"
              value={formatMinShort(draft.endMin)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number)
                setDraft({ ...draft, endMin: h * 60 + m })
              }}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Category
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft({ ...draft, category: e.target.value as BlockCategory })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            XP
            <input
              type="number"
              min={0}
              value={draft.xp}
              onChange={(e) => setDraft({ ...draft, xp: Number(e.target.value) || 0 })}
            />
          </label>
        </div>

        <label>
          Color
          <input
            type="color"
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          />
        </label>

        <footer className="modal__foot">
          {onDelete && (
            <button type="button" className="btn btn--danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={() => onSave(draft)}>
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
