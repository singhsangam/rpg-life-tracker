import type { Achievement } from '../types'

export function AchievementsPanel({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter((a) => a.unlocked).length
  return (
    <section className="panel">
      <header className="panel__head">
        <h2>Achievements</h2>
        <span className="pill">
          {unlocked}/{achievements.length}
        </span>
      </header>
      <ul className="ach-list">
        {achievements.map((a) => (
          <li key={a.id} className={a.unlocked ? 'unlocked' : ''}>
            <div>
              <strong>{a.name}</strong>
              <span>{a.description}</span>
            </div>
            <em>
              {a.current}/{a.target} · +{a.xp}
            </em>
          </li>
        ))}
      </ul>
    </section>
  )
}
