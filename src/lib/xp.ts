export type RankInfo = {
  id: string
  name: string
  minLevel: number
  maxLevel: number
  accent: string
}

export const RANKS: RankInfo[] = [
  { id: 'novice', name: 'Novice', minLevel: 1, maxLevel: 5, accent: '#8fa89a' },
  { id: 'apprentice', name: 'Apprentice', minLevel: 6, maxLevel: 15, accent: '#39ff14' },
  { id: 'journeyman', name: 'Journeyman', minLevel: 16, maxLevel: 30, accent: '#2ee6d6' },
  { id: 'expert', name: 'Expert', minLevel: 31, maxLevel: 50, accent: '#4da3ff' },
  { id: 'master', name: 'Master', minLevel: 51, maxLevel: 70, accent: '#7b5cff' },
  { id: 'grandmaster', name: 'Grandmaster', minLevel: 71, maxLevel: 85, accent: '#c084fc' },
  { id: 'legend', name: 'Legend', minLevel: 86, maxLevel: 95, accent: '#fbbf24' },
  { id: 'mythic', name: 'Mythic', minLevel: 96, maxLevel: 100, accent: '#f59e0b' },
]

/** Quadratic level curve from Life RPG sheet */
export function levelFromXp(totalXp: number): number {
  const xp = Math.max(0, totalXp)
  const level = Math.floor((-75 + Math.sqrt(75 ** 2 + 4 * 25 * xp)) / (2 * 25))
  return Math.max(1, Math.min(100, level))
}

export function xpToNext(totalXp: number): number {
  const level = levelFromXp(totalXp)
  return 25 * (level + 1) ** 2 + 75 * (level + 1) - totalXp
}

export function progressPercent(totalXp: number): number {
  const level = levelFromXp(totalXp)
  const remaining = xpToNext(totalXp)
  const band = 50 * (level + 1) + 100
  return Math.max(0, Math.min(100, Math.round(((band - remaining) / band) * 100)))
}

export function rankFromLevel(level: number): RankInfo {
  return RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) ?? RANKS[0]
}

export function streakTier(streak: number): string {
  if (streak >= 365) return 'Legendary'
  if (streak >= 100) return 'Diamond'
  if (streak >= 30) return 'Gold'
  if (streak >= 7) return 'Silver'
  if (streak >= 1) return 'Bronze'
  return '—'
}
