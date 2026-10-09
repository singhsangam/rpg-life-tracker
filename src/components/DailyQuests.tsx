import { useState } from 'react'
import type { DailyQuest } from '../types'

type Props = {
  quests: DailyQuest[]
  essential?: boolean
  onToggle: (id: string) => void
  onAdd: (quest: Omit<DailyQuest, 'id' | 'done'>) => void
  onRemove: (id: string) => void
}

export function DailyQuests({ quests, essential, onToggle, onAdd, onRemove }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [xp, setXp] = useState(25)

  const done = quests.filter((q) => q.done).length
  const listed = essential
    ? [...quests].sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 3)
    : quests

  return (
    <section className="panel">
      <header className="panel__head">
        <div>
          <h2>Daily Quests</h2>
          <p className="muted">
            {done} / {quests.length} complete
          </p>
        </div>
        {!essential && (
          <button type="button" className="btn btn--ghost" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? 'Close' : '+ Add'}
          </button>
        )}
      </header>

      {showAdd && (
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onAdd({
              name: name.trim(),
              category: 'Custom',
              difficulty: 'Medium',
              xp,
            })
            setName('')
            setShowAdd(false)
          }}
        >
          <input
            placeholder="Quest name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            min={5}
            value={xp}
            onChange={(e) => setXp(Number(e.target.value) || 0)}
          />
          <button type="submit" className="btn btn--primary">
            Save
          </button>
        </form>
      )}

      <ul className="quest-list">
        {listed.map((q) => (
          <li key={q.id} className={q.done ? 'done' : ''}>
            <button type="button" className="check" onClick={() => onToggle(q.id)} aria-pressed={q.done}>
              {q.done ? '✓' : ''}
            </button>
            <div className="quest-body">
              <strong>{q.name}</strong>
              <span>
                {q.category} · {q.difficulty} · +{q.xp} XP
              </span>
            </div>
            {!essential && (
              <button type="button" className="icon-btn" onClick={() => onRemove(q.id)} aria-label="Remove">
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
