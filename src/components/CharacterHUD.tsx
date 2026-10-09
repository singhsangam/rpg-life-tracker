import { levelFromXp, progressPercent, rankFromLevel, xpToNext } from '../lib/xp'
import type { Player } from '../types'

export function CharacterHUD({ player, availableXp }: { player: Player; availableXp: number }) {
  const level = levelFromXp(player.totalXp)
  const rank = rankFromLevel(level)
  const pct = progressPercent(player.totalXp)
  const toNext = xpToNext(player.totalXp)

  return (
    <section className="hud" style={{ ['--rank' as string]: rank.accent }}>
      <div className="hud__brand">
        <p className="brand-mark">LIFE RPG</p>
        <h1>{player.name}</h1>
        <p className="muted">{player.title}</p>
      </div>

      <div className="hud__stats">
        <div className="stat-chip">
          <span>Level</span>
          <strong>{level}</strong>
        </div>
        <div className="stat-chip">
          <span>Rank</span>
          <strong style={{ color: rank.accent }}>{rank.name}</strong>
        </div>
        <div className="stat-chip">
          <span>Available XP</span>
          <strong>{availableXp}</strong>
        </div>
        <div className="stat-chip">
          <span>Today</span>
          <strong>+{player.todayXp}</strong>
        </div>
        <div className="stat-chip">
          <span>Login streak</span>
          <strong>{player.loginStreak}d</strong>
        </div>
      </div>

      <div className="xp-bar-wrap">
        <div className="xp-bar-meta">
          <span>
            {player.totalXp} XP · {toNext} to next
          </span>
          <span>{pct}%</span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  )
}
