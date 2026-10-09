import { useEffect, useMemo, useState } from 'react'
import { AchievementsPanel } from './components/AchievementsPanel'
import { AuthScreen } from './components/AuthScreen'
import { CharacterHUD } from './components/CharacterHUD'
import { DailyQuests } from './components/DailyQuests'
import { EditBlockModal } from './components/EditBlockModal'
import { HabitsPanel } from './components/HabitsPanel'
import { LifeRadar } from './components/LifeRadar'
import { RewardsShop } from './components/RewardsShop'
import { RoutineWheel } from './components/RoutineWheel'
import { SyncDock } from './components/SyncDock'
import { currentHalf, isActiveBlock, isWeekend, minutesNow } from './lib/time'
import { GameProvider, useGame } from './store/GameContext'
import type { TimeBlock, ViewId } from './types'

function AppShell() {
  const {
    state,
    availableXp,
    account,
    username,
    syncStatus,
    syncError,
    lastSyncedAt,
    showAuth,
    setShowAuth,
    setMode,
    updateBlock,
    removeBlock,
    checkInBlock,
    toggleQuest,
    addQuest,
    removeQuest,
    toggleHabit,
    redeem,
    addShopItem,
    updateScores,
    resetAll,
    registerAccount,
    loginAccount,
    signOut,
    syncNow,
  } = useGame()

  const [view, setView] = useState<ViewId>('dashboard')
  const [now, setNow] = useState(() => minutesNow())
  const [editing, setEditing] = useState<{
    wheelId: 'weekday' | 'weekend'
    block: TimeBlock
  } | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(minutesNow()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  const weekend = isWeekend()
  const half = currentHalf(now)
  const activeWheelId = weekend ? 'weekend' : 'weekday'
  const weekday = state.wheels.find((w) => w.id === 'weekday')!
  const weekendWheel = state.wheels.find((w) => w.id === 'weekend')!

  const essentialActive = useMemo(() => {
    const wheel = weekend ? weekendWheel : weekday
    return wheel.blocks.find((b) => isActiveBlock(b.startMin, b.endMin, now))
  }, [weekend, weekendWheel, weekday, now])

  if (showAuth && !account) {
    return (
      <AuthScreen
        onSkip={() => setShowAuth(false)}
        onRegister={registerAccount}
        onLogin={loginAccount}
      />
    )
  }

  return (
    <div className={`app mode-${state.mode}`}>
      <div className="atmosphere" aria-hidden />

      <header className="topbar">
        <CharacterHUD player={state.player} availableXp={availableXp} />
        <div className="topbar__controls">
          <SyncDock
            username={username}
            token={account?.token ?? null}
            syncStatus={syncStatus}
            syncError={syncError}
            lastSyncedAt={lastSyncedAt}
            onSync={syncNow}
            onSignOut={signOut}
            onOpenAuth={() => setShowAuth(true)}
          />
          <label className="mode-toggle">
            <span>{state.mode === 'essential' ? 'Essential' : 'Full RPG'}</span>
            <input
              type="checkbox"
              checked={state.mode === 'full'}
              onChange={(e) => setMode(e.target.checked ? 'full' : 'essential')}
            />
          </label>
        </div>
      </header>

      {state.toast && <div className="toast">{state.toast}</div>}

      <main className="main">
        {state.mode === 'essential' ? (
          <div className="essential-layout">
            <section className="panel essential-hero">
              <p className="eyebrow">Right now</p>
              <h2>{essentialActive?.label ?? 'Free / unscheduled'}</h2>
              {essentialActive && (
                <>
                  <p className="muted">+{essentialActive.xp} XP on check-in</p>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => checkInBlock(activeWheelId, essentialActive.id)}
                  >
                    Check-In
                  </button>
                </>
              )}
            </section>
            <DailyQuests
              quests={state.quests}
              essential
              onToggle={toggleQuest}
              onAdd={addQuest}
              onRemove={removeQuest}
            />
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <div className="dash-grid">
                <div className="clocks-board">
                  <p className="clocks-hint">
                    Four normal clocks cover a full day. Only the one matching{' '}
                    <strong>today + current AM/PM</strong> lights up — others stay readable but dim.
                  </p>
                  <div className="wheels-row">
                    <RoutineWheel
                      title="Weekday · Morning"
                      subtitle="12 AM – 12 PM"
                      half="am"
                      blocks={weekday.blocks}
                      live={!weekend && half === 'am'}
                      onSelect={(block) => setEditing({ wheelId: 'weekday', block })}
                      onCheckIn={(id) => checkInBlock('weekday', id)}
                    />
                    <RoutineWheel
                      title="Weekday · Afternoon"
                      subtitle="12 PM – 12 AM"
                      half="pm"
                      blocks={weekday.blocks}
                      live={!weekend && half === 'pm'}
                      onSelect={(block) => setEditing({ wheelId: 'weekday', block })}
                      onCheckIn={(id) => checkInBlock('weekday', id)}
                    />
                    <RoutineWheel
                      title="Weekend · Morning"
                      subtitle="12 AM – 12 PM"
                      half="am"
                      blocks={weekendWheel.blocks}
                      live={weekend && half === 'am'}
                      onSelect={(block) => setEditing({ wheelId: 'weekend', block })}
                      onCheckIn={(id) => checkInBlock('weekend', id)}
                    />
                    <RoutineWheel
                      title="Weekend · Afternoon"
                      subtitle="12 PM – 12 AM"
                      half="pm"
                      blocks={weekendWheel.blocks}
                      live={weekend && half === 'pm'}
                      onSelect={(block) => setEditing({ wheelId: 'weekend', block })}
                      onCheckIn={(id) => checkInBlock('weekend', id)}
                    />
                  </div>
                </div>

                <div className="side-stack">
                  <DailyQuests
                    quests={state.quests}
                    onToggle={toggleQuest}
                    onAdd={addQuest}
                    onRemove={removeQuest}
                  />
                  <LifeRadar
                    scores={state.player.lifeScores}
                    editable
                    onChange={(key, value) => updateScores({ [key]: value })}
                  />
                </div>
              </div>
            )}

            {view === 'quests' && (
              <DailyQuests
                quests={state.quests}
                onToggle={toggleQuest}
                onAdd={addQuest}
                onRemove={removeQuest}
              />
            )}

            {view === 'habits' && (
              <HabitsPanel habits={state.habits} onToggle={toggleHabit} />
            )}

            {view === 'shop' && (
              <RewardsShop
                items={state.shop}
                availableXp={availableXp}
                redemptions={state.redemptions}
                onRedeem={redeem}
                onAdd={addShopItem}
              />
            )}

            {view === 'stats' && (
              <div className="stats-grid">
                <LifeRadar
                  scores={state.player.lifeScores}
                  editable
                  onChange={(key, value) => updateScores({ [key]: value })}
                />
                <AchievementsPanel achievements={state.achievements} />
                <section className="panel">
                  <header className="panel__head">
                    <h2>Settings</h2>
                  </header>
                  <p className="muted">
                    Phone + laptop: sign in with the same ID to keep progress in the cloud. Without
                    sign-in, this browser still remembers everything locally.
                  </p>
                  <button type="button" className="btn btn--danger" onClick={resetAll}>
                    Reset all data
                  </button>
                </section>
              </div>
            )}
          </>
        )}
      </main>

      {state.mode === 'full' && (
        <nav className="bottom-nav" aria-label="Primary">
          {(
            [
              ['dashboard', 'Wheels'],
              ['quests', 'Quests'],
              ['habits', 'Habits'],
              ['shop', 'Shop'],
              ['stats', 'Stats'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={view === id ? 'active' : ''}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      <EditBlockModal
        open={!!editing}
        block={editing?.block ?? null}
        onClose={() => setEditing(null)}
        onSave={(block) => {
          if (!editing) return
          updateBlock(editing.wheelId, block)
          setEditing(null)
        }}
        onDelete={
          editing
            ? () => {
                removeBlock(editing.wheelId, editing.block.id)
                setEditing(null)
              }
            : undefined
        }
      />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  )
}
