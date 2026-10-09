import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  clearStoredAccount,
  isSyncConfigured,
  loginAccount as apiLogin,
  logoutAccount,
  pullLifeRpg,
  pushLifeRpg,
  readStoredAccount,
  registerAccount as apiRegister,
  whoami,
  type AccountSession,
} from '../lib/accountAuth'
import { loadState, resetState, saveState } from '../lib/storage'
import { mergeGameState, type SyncStatus } from '../lib/sync'
import { todayKey } from '../lib/time'
import type {
  AppMode,
  DailyQuest,
  GameState,
  Habit,
  LifeScores,
  ShopItem,
  TimeBlock,
} from '../types'

type GameContextValue = {
  state: GameState
  availableXp: number
  account: AccountSession | null
  username: string | null
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncedAt: string | null
  showAuth: boolean
  setShowAuth: (v: boolean) => void
  setMode: (mode: AppMode) => void
  setToast: (msg: string | null) => void
  updateBlock: (wheelId: 'weekday' | 'weekend', block: TimeBlock) => void
  addBlock: (wheelId: 'weekday' | 'weekend', block: Omit<TimeBlock, 'id'>) => void
  removeBlock: (wheelId: 'weekday' | 'weekend', blockId: string) => void
  checkInBlock: (wheelId: 'weekday' | 'weekend', blockId: string) => void
  toggleQuest: (questId: string) => void
  addQuest: (quest: Omit<DailyQuest, 'id' | 'done'>) => void
  removeQuest: (questId: string) => void
  toggleHabit: (habitId: string) => void
  redeem: (itemId: string) => void
  addShopItem: (item: Omit<ShopItem, 'id' | 'redeemedCount'>) => void
  updateScores: (scores: Partial<LifeScores>) => void
  updatePlayer: (patch: Partial<GameState['player']>) => void
  resetAll: () => void
  registerAccount: (username: string, password: string) => Promise<void>
  loginAccount: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  syncNow: () => Promise<void>
}

const GameContext = createContext<GameContextValue | null>(null)

function bumpAchievements(state: GameState): GameState {
  const doneToday = state.quests.filter((q) => q.done).length
  const habitsToday = state.habits.filter((h) => h.checks[todayKey()]).length
  let xpGain = 0
  const achievements = state.achievements.map((a) => {
    if (a.unlocked) return a
    let current = a.current
    if (a.name === 'First Quest') current = doneToday > 0 ? 1 : 0
    if (a.name === 'Daily Dozen') current = doneToday
    if (a.name === 'Week Warrior') current = state.player.loginStreak
    if (a.name === 'Habit Spark') current = habitsToday
    if (a.name === 'Shopper') current = state.redemptions.length
    if (current >= a.target) {
      xpGain += a.xp
      return {
        ...a,
        current: a.target,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      }
    }
    return { ...a, current }
  })
  if (!xpGain) return { ...state, achievements }
  return {
    ...state,
    achievements,
    player: {
      ...state.player,
      totalXp: state.player.totalXp + xpGain,
      todayXp: state.player.todayXp + xpGain,
    },
    toast: `Achievement unlocked! +${xpGain} XP`,
  }
}

function touch(state: GameState): GameState {
  return { ...state, updatedAt: new Date().toISOString() }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const boot = readStoredAccount()
  const [state, setState] = useState<GameState>(() => loadState())
  const [account, setAccount] = useState<AccountSession | null>(boot)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    isSyncConfigured() ? (boot ? 'idle' : 'idle') : 'unconfigured',
  )
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(() => Boolean(isSyncConfigured() && !boot))
  const skipPush = useRef(false)
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef(state)
  const accountRef = useRef(account)

  useEffect(() => {
    stateRef.current = state
  }, [state])
  useEffect(() => {
    accountRef.current = account
  }, [account])

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    if (state.toast) {
      const t = window.setTimeout(() => {
        setState((s) => ({ ...s, toast: null }))
      }, 2600)
      return () => window.clearTimeout(t)
    }
  }, [state.toast])

  const syncNow = useCallback(async () => {
    if (!isSyncConfigured()) {
      setSyncStatus('unconfigured')
      return
    }
    const token = accountRef.current?.token
    if (!token) {
      setSyncStatus('idle')
      return
    }
    setSyncStatus('syncing')
    setSyncError(null)
    try {
      const remote = await pullLifeRpg(token)
      const local = stateRef.current
      const merged = mergeGameState(
        { ...local, updatedAt: local.updatedAt || new Date().toISOString() },
        remote,
      )
      skipPush.current = true
      setState({ ...merged, toast: null })
      await pushLifeRpg(token, {
        ...merged,
        toast: null,
        updatedAt: merged.updatedAt || new Date().toISOString(),
      })
      setSyncStatus('synced')
      setLastSyncedAt(new Date().toISOString())
    } catch (e) {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false
      const msg = e instanceof Error ? e.message : 'Sync failed'
      if (/Not signed in/i.test(msg)) {
        clearStoredAccount()
        setAccount(null)
        setSyncStatus('idle')
        setSyncError('Session expired — sign in again.')
        setShowAuth(true)
        return
      }
      setSyncStatus(offline ? 'offline' : 'error')
      setSyncError(msg)
    } finally {
      window.setTimeout(() => {
        skipPush.current = false
      }, 50)
    }
  }, [])

  const schedulePush = useCallback(() => {
    if (!isSyncConfigured() || !accountRef.current?.token || skipPush.current) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      void syncNow()
    }, 900)
  }, [syncNow])

  useEffect(() => {
    if (skipPush.current) return
    schedulePush()
  }, [state.updatedAt, schedulePush])

  useEffect(() => {
    if (!account?.token) return
    void whoami(account.token).then((session) => {
      if (!session) {
        clearStoredAccount()
        setAccount(null)
        setShowAuth(true)
        return
      }
      void syncNow()
    })
  }, [account?.token, syncNow])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && accountRef.current?.token) {
        void syncNow()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onVis)
    }
  }, [syncNow])

  // Poll cloud so phone ↔ laptop stay close without manual Sync
  useEffect(() => {
    if (!account?.token || !isSyncConfigured()) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void syncNow()
    }, 8000)
    return () => window.clearInterval(id)
  }, [account?.token, syncNow])

  const availableXp = state.player.totalXp - state.player.spentXp

  const patch = useCallback((fn: (s: GameState) => GameState) => {
    setState((s) => touch(bumpAchievements(fn(s))))
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      availableXp,
      account,
      username: account?.username ?? null,
      syncStatus,
      syncError,
      lastSyncedAt,
      showAuth,
      setShowAuth,
      setMode: (mode) => setState((s) => touch({ ...s, mode })),
      setToast: (msg) => setState((s) => ({ ...s, toast: msg })),
      updateBlock: (wheelId, block) =>
        patch((s) => ({
          ...s,
          wheels: s.wheels.map((w) =>
            w.id === wheelId
              ? { ...w, blocks: w.blocks.map((b) => (b.id === block.id ? block : b)) }
              : w,
          ),
        })),
      addBlock: (wheelId, block) =>
        patch((s) => ({
          ...s,
          wheels: s.wheels.map((w) =>
            w.id === wheelId
              ? { ...w, blocks: [...w.blocks, { ...block, id: crypto.randomUUID() }] }
              : w,
          ),
          toast: 'Time block added',
        })),
      removeBlock: (wheelId, blockId) =>
        patch((s) => ({
          ...s,
          wheels: s.wheels.map((w) =>
            w.id === wheelId
              ? { ...w, blocks: w.blocks.filter((b) => b.id !== blockId) }
              : w,
          ),
        })),
      checkInBlock: (wheelId, blockId) =>
        patch((s) => {
          const today = todayKey()
          let gained = 0
          const wheels = s.wheels.map((w) => {
            if (w.id !== wheelId) return w
            return {
              ...w,
              blocks: w.blocks.map((b) => {
                if (b.id !== blockId) return b
                if (b.checkedInDate === today) return b
                gained = b.xp
                return { ...b, checkedInDate: today }
              }),
            }
          })
          if (!gained) return { ...s, toast: 'Already checked in' }
          try {
            navigator.vibrate?.(12)
          } catch {
            /* ignore */
          }
          return {
            ...s,
            wheels,
            player: {
              ...s.player,
              totalXp: s.player.totalXp + gained,
              todayXp: s.player.todayXp + gained,
            },
            toast: `Check-in! +${gained} XP`,
          }
        }),
      toggleQuest: (questId) =>
        patch((s) => {
          const quest = s.quests.find((q) => q.id === questId)
          if (!quest) return s
          const done = !quest.done
          const delta = done ? quest.xp : -quest.xp
          try {
            if (done) navigator.vibrate?.(18)
          } catch {
            /* ignore */
          }
          return {
            ...s,
            quests: s.quests.map((q) =>
              q.id === questId
                ? {
                    ...q,
                    done,
                    completedAt: done ? new Date().toISOString() : undefined,
                  }
                : q,
            ),
            player: {
              ...s.player,
              totalXp: Math.max(0, s.player.totalXp + delta),
              todayXp: Math.max(0, s.player.todayXp + (done ? quest.xp : -quest.xp)),
            },
            toast: done ? `Quest complete! +${quest.xp} XP` : 'Quest unchecked',
          }
        }),
      addQuest: (quest) =>
        patch((s) => ({
          ...s,
          quests: [...s.quests, { ...quest, id: crypto.randomUUID(), done: false }],
          toast: 'Quest added',
        })),
      removeQuest: (questId) =>
        patch((s) => ({
          ...s,
          quests: s.quests.filter((q) => q.id !== questId),
        })),
      toggleHabit: (habitId) =>
        patch((s) => {
          const today = todayKey()
          const habits = s.habits.map((h: Habit) => {
            if (h.id !== habitId) return h
            const was = !!h.checks[today]
            const checks = { ...h.checks, [today]: !was }
            if (was) delete checks[today]
            let streak = h.streak
            let longest = h.longest
            if (!was) {
              streak = h.streak + 1
              longest = Math.max(longest, streak)
            } else {
              streak = Math.max(0, h.streak - 1)
            }
            return { ...h, checks, streak, longest }
          })
          const awarding = !s.habits.find((h) => h.id === habitId)?.checks[today]
          return {
            ...s,
            habits,
            player: awarding
              ? {
                  ...s.player,
                  totalXp: s.player.totalXp + 10,
                  todayXp: s.player.todayXp + 10,
                }
              : s.player,
            toast: awarding ? 'Habit logged! +10 XP' : 'Habit unchecked',
          }
        }),
      redeem: (itemId) =>
        patch((s) => {
          const item = s.shop.find((i) => i.id === itemId)
          if (!item) return s
          const available = s.player.totalXp - s.player.spentXp
          if (available < item.cost) {
            return { ...s, toast: 'Not enough XP' }
          }
          return {
            ...s,
            player: { ...s.player, spentXp: s.player.spentXp + item.cost },
            shop: s.shop.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    redeemedCount: i.redeemedCount + 1,
                    lastRedeemedAt: new Date().toISOString(),
                  }
                : i,
            ),
            redemptions: [
              {
                id: crypto.randomUUID(),
                itemId,
                name: item.name,
                cost: item.cost,
                at: new Date().toISOString(),
              },
              ...s.redemptions,
            ],
            toast: `Redeemed ${item.name} (−${item.cost} XP)`,
          }
        }),
      addShopItem: (item) =>
        patch((s) => ({
          ...s,
          shop: [...s.shop, { ...item, id: crypto.randomUUID(), redeemedCount: 0 }],
          toast: 'Reward added to shop',
        })),
      updateScores: (scores) =>
        setState((s) =>
          touch({
            ...s,
            player: { ...s.player, lifeScores: { ...s.player.lifeScores, ...scores } },
          }),
        ),
      updatePlayer: (playerPatch) =>
        setState((s) => touch({ ...s, player: { ...s.player, ...playerPatch } })),
      resetAll: () => setState(resetState()),
      registerAccount: async (username, password) => {
        const session = await apiRegister(username, password)
        setAccount(session)
        setShowAuth(false)
        await syncNow()
      },
      loginAccount: async (username, password) => {
        const session = await apiLogin(username, password)
        setAccount(session)
        setShowAuth(false)
        await syncNow()
      },
      signOut: async () => {
        if (account?.token) await logoutAccount(account.token)
        else clearStoredAccount()
        setAccount(null)
        setSyncStatus('idle')
        setShowAuth(true)
      },
      syncNow,
    }),
    [
      state,
      availableXp,
      account,
      syncStatus,
      syncError,
      lastSyncedAt,
      showAuth,
      patch,
      syncNow,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
