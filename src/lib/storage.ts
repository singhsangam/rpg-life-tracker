import { createInitialState } from '../data/seed'
import type { GameState } from '../types'
import { todayKey } from './time'

const KEY = 'rpg-life-tracker-v1'

function ensureUpdatedAt(state: GameState): GameState {
  if (state.updatedAt) return state
  return { ...state, updatedAt: new Date().toISOString() }
}

function rollLoginStreak(state: GameState): GameState {
  const today = todayKey()
  if (state.player.lastLoginDate === today) {
    if (state.player.todayDate !== today) {
      return {
        ...state,
        player: { ...state.player, todayDate: today, todayXp: 0 },
        quests: state.quests.map((q) => ({ ...q, done: false, completedAt: undefined })),
      }
    }
    return state
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = todayKey(yesterday)
  const continued = state.player.lastLoginDate === yKey
  const loginStreak = continued ? state.player.loginStreak + 1 : 1

  return {
    ...state,
    player: {
      ...state.player,
      lastLoginDate: today,
      todayDate: today,
      todayXp: 0,
      loginStreak,
    },
    quests: state.quests.map((q) => ({ ...q, done: false, completedAt: undefined })),
  }
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return rollLoginStreak(createInitialState())
    const parsed = JSON.parse(raw) as GameState
    if (!parsed?.version || !parsed.player || !parsed.wheels) {
      return rollLoginStreak(createInitialState())
    }
    return rollLoginStreak(ensureUpdatedAt(parsed))
  } catch {
    return rollLoginStreak(createInitialState())
  }
}

export function saveState(state: GameState) {
  const { toast: _toast, ...rest } = state
  localStorage.setItem(KEY, JSON.stringify(rest))
}

export function resetState(): GameState {
  const fresh = createInitialState()
  saveState(fresh)
  return fresh
}
