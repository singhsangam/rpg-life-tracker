import type { GameState } from '../types'
import { getSupabase, isSyncConfigured } from './supabase'

export const ACCOUNT_TOKEN_KEY = 'rpg-life-tracker-account-token'
export const ACCOUNT_USER_KEY = 'rpg-life-tracker-account-user'
export const MAX_DEVICES = 5

export type AccountSession = {
  token: string
  accountId: string
  username: string
}

export type DeviceInfo = {
  id: string | number
  device_name: string
  created_at: string
  last_seen_at: string
  is_current: boolean
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

export function guessDeviceName(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  if (/iPad/i.test(ua)) return 'iPad'
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return 'Android phone'
  if (/Android/i.test(ua)) return 'Android tablet'
  if (/Macintosh/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows PC'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Browser'
}

export function readStoredAccount(): AccountSession | null {
  try {
    const token = localStorage.getItem(ACCOUNT_TOKEN_KEY)
    const raw = localStorage.getItem(ACCOUNT_USER_KEY)
    if (!token || !raw) return null
    const parsed = JSON.parse(raw) as { accountId: string; username: string }
    if (!parsed.accountId || !parsed.username) return null
    return { token, accountId: parsed.accountId, username: parsed.username }
  } catch {
    return null
  }
}

export function writeStoredAccount(session: AccountSession) {
  localStorage.setItem(ACCOUNT_TOKEN_KEY, session.token)
  localStorage.setItem(
    ACCOUNT_USER_KEY,
    JSON.stringify({ accountId: session.accountId, username: session.username }),
  )
}

export function clearStoredAccount() {
  localStorage.removeItem(ACCOUNT_TOKEN_KEY)
  localStorage.removeItem(ACCOUNT_USER_KEY)
}

function unpackRow<T>(data: unknown): T | null {
  if (!data) return null
  if (Array.isArray(data)) return (data[0] as T) ?? null
  return data as T
}

export async function registerAccount(
  username: string,
  password: string,
): Promise<AccountSession> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  const { data, error } = await sb.rpc('app_register', {
    p_username: normalizeUsername(username),
    p_password: password,
  })
  if (error) throw new Error(error.message)
  const row = unpackRow<{ token: string; account_id: string; username: string }>(data)
  if (!row?.token) throw new Error('Could not create account')
  const session = {
    token: row.token,
    accountId: row.account_id,
    username: row.username,
  }
  writeStoredAccount(session)
  return session
}

export async function loginAccount(
  username: string,
  password: string,
  deviceName = guessDeviceName(),
): Promise<AccountSession> {
  const sb = getSupabase()
  if (!sb) throw new Error('Cloud is not configured')
  const { data, error } = await sb.rpc('app_login', {
    p_username: normalizeUsername(username),
    p_password: password,
    p_device_name: deviceName,
  })
  if (error) throw new Error(error.message)
  const row = unpackRow<{ token: string; account_id: string; username: string }>(data)
  if (!row?.token) throw new Error('Could not sign in')
  const session = {
    token: row.token,
    accountId: row.account_id,
    username: row.username,
  }
  writeStoredAccount(session)
  return session
}

export async function logoutAccount(token: string): Promise<void> {
  const sb = getSupabase()
  if (sb) {
    await sb.rpc('app_logout', { p_token: token })
  }
  clearStoredAccount()
}

export async function whoami(token: string): Promise<AccountSession | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.rpc('app_whoami', { p_token: token })
  if (error) return null
  const row = unpackRow<{ account_id: string; username: string }>(data)
  if (!row?.account_id) return null
  return { token, accountId: row.account_id, username: row.username }
}

export async function listDevices(token: string): Promise<DeviceInfo[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb.rpc('app_list_devices', { p_token: token })
  if (error) throw new Error(error.message)
  return (data as DeviceInfo[]) ?? []
}

export async function pullLifeRpg(
  token: string,
): Promise<(GameState & { updatedAt: string }) | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.rpc('life_rpg_fetch', { p_token: token })
  if (error) throw new Error(error.message)
  const row = unpackRow<{
    schema_version: number
    payload: GameState
    updated_at: string
  }>(data)
  if (!row?.payload || typeof row.payload !== 'object') return null
  // Empty placeholder row from a brand-new account
  if (!(row.payload as GameState).player || !(row.payload as GameState).wheels) return null
  return { ...row.payload, updatedAt: row.updated_at }
}

export async function pushLifeRpg(
  token: string,
  state: GameState & { updatedAt: string },
): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const { error } = await sb.rpc('life_rpg_upsert', {
    p_token: token,
    p_schema: state.version ?? 1,
    p_payload: state,
    p_updated: state.updatedAt,
  })
  if (error) throw new Error(error.message)
}

export { isSyncConfigured }
