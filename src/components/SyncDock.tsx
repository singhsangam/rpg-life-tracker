import { useEffect, useState } from 'react'
import {
  isSyncConfigured,
  listDevices,
  MAX_DEVICES,
  type DeviceInfo,
} from '../lib/accountAuth'
import type { SyncStatus } from '../lib/sync'

type Props = {
  username: string | null
  token: string | null
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncedAt: string | null
  onSync: () => Promise<void>
  onSignOut: () => Promise<void>
  onOpenAuth: () => void
}

export function SyncDock({
  username,
  token,
  syncStatus,
  syncError,
  lastSyncedAt,
  onSync,
  onSignOut,
  onOpenAuth,
}: Props) {
  const [open, setOpen] = useState(false)
  const [devices, setDevices] = useState<DeviceInfo[]>([])

  useEffect(() => {
    if (!open || !token) return
    void listDevices(token)
      .then(setDevices)
      .catch(() => setDevices([]))
  }, [open, token, lastSyncedAt])

  if (!username) {
    return (
      <div className="sync-dock">
        <button type="button" className="sync-pill status-unconfigured" onClick={onOpenAuth}>
          <span className="dot" />
          {isSyncConfigured() ? 'Sign in to sync' : 'Local only'}
        </button>
      </div>
    )
  }

  const statusLabel =
    syncStatus === 'synced'
      ? 'Synced'
      : syncStatus === 'syncing'
        ? 'Syncing…'
        : syncStatus === 'error'
          ? 'Sync issue'
          : syncStatus === 'offline'
            ? 'Offline'
            : 'Signed in'

  return (
    <div className="sync-dock">
      <button
        type="button"
        className={`sync-pill status-${syncStatus}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dot" />
        {statusLabel}
      </button>

      {open && (
        <div className="sync-panel">
          <h3>Cloud sync</h3>
          <p className="muted">
            ID <strong>{username}</strong> · up to {MAX_DEVICES} devices
          </p>
          {lastSyncedAt && (
            <p className="muted">Last sync {new Date(lastSyncedAt).toLocaleString()}</p>
          )}
          {syncError && <p className="error-text">{syncError}</p>}
          <div className="sync-actions">
            <button type="button" className="btn btn--primary" onClick={() => void onSync()}>
              Sync now
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => void onSignOut()}>
              Sign out
            </button>
          </div>
          {devices.length > 0 && (
            <ul className="device-list">
              {devices.map((d) => (
                <li key={String(d.id)}>
                  {d.device_name}
                  {d.is_current ? ' · this device' : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
