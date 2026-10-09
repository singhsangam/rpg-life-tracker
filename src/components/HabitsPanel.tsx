import { streakTier } from '../lib/xp'
import { todayKey } from '../lib/time'
import type { Habit } from '../types'

type Props = {
  habits: Habit[]
  onToggle: (id: string) => void
}

export function HabitsPanel({ habits, onToggle }: Props) {
  const today = todayKey()
  const done = habits.filter((h) => h.checks[today]).length

  return (
    <section className="panel">
      <header className="panel__head">
        <div>
          <h2>Habit Tracker</h2>
          <p className="muted">
            Today {done}/{habits.length}
          </p>
        </div>
      </header>

      <ul className="habit-list">
        {habits.map((h) => {
          const checked = !!h.checks[today]
          return (
            <li key={h.id}>
              <button
                type="button"
                className={`check ${checked ? 'on' : ''}`}
                onClick={() => onToggle(h.id)}
                aria-pressed={checked}
              >
                {checked ? '✓' : ''}
              </button>
              <div>
                <strong>{h.name}</strong>
                <span>
                  Streak {h.streak} · Best {h.longest} · {streakTier(h.streak)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
