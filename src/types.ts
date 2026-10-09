export type AppMode = 'essential' | 'full'
export type ViewId = 'dashboard' | 'quests' | 'habits' | 'shop' | 'stats'

export type BlockCategory =
  | 'sleep'
  | 'workout'
  | 'reading'
  | 'fresh'
  | 'office'
  | 'lunch'
  | 'relax'
  | 'music'
  | 'walk'
  | 'dinner'
  | 'free'
  | 'custom'

export interface TimeBlock {
  id: string
  label: string
  category: BlockCategory
  startMin: number
  endMin: number
  color: string
  xp: number
  checkedInDate?: string
}

export interface RoutineWheel {
  id: 'weekday' | 'weekend'
  name: string
  blocks: TimeBlock[]
}

export interface LifeScores {
  mood: number
  energy: number
  health: number
  learning: number
  finance: number
  social: number
  career: number
  discipline: number
}

export interface DailyQuest {
  id: string
  name: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary'
  xp: number
  done: boolean
  completedAt?: string
  notes?: string
}

export interface Habit {
  id: string
  name: string
  streak: number
  longest: number
  checks: Record<string, boolean>
}

export interface ShopItem {
  id: string
  name: string
  cost: number
  tier: string
  notes?: string
  redeemedCount: number
  lastRedeemedAt?: string
}

export interface Redemption {
  id: string
  itemId: string
  name: string
  cost: number
  at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  target: number
  current: number
  unlocked: boolean
  xp: number
  unlockedAt?: string
}

export interface Player {
  name: string
  title: string
  totalXp: number
  spentXp: number
  todayXp: number
  todayDate: string
  loginStreak: number
  lastLoginDate: string
  lifeScores: LifeScores
}

export interface GameState {
  version: number
  updatedAt: string
  mode: AppMode
  player: Player
  wheels: RoutineWheel[]
  quests: DailyQuest[]
  habits: Habit[]
  shop: ShopItem[]
  redemptions: Redemption[]
  achievements: Achievement[]
  toast?: string | null
}
