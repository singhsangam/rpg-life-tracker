import type { GameState } from '../types'

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error'
  | 'unconfigured'

/** Last-write-wins merge for the whole Life RPG save blob. */
export function mergeGameState(
  local: GameState & { updatedAt: string },
  remote: (GameState & { updatedAt: string }) | null,
): GameState & { updatedAt: string } {
  if (!remote) return local
  const localTs = Date.parse(local.updatedAt)
  const remoteTs = Date.parse(remote.updatedAt)
  if (!Number.isNaN(remoteTs) && (Number.isNaN(localTs) || remoteTs > localTs)) {
    return { ...remote, toast: null }
  }
  return local
}
