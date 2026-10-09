import { useState, type FormEvent } from 'react'
import { isSyncConfigured, MAX_DEVICES } from '../lib/accountAuth'

type Mode = 'signup' | 'signin'

type Props = {
  onSkip: () => void
  onRegister: (username: string, password: string) => Promise<void>
  onLogin: (username: string, password: string) => Promise<void>
}

/** Same idea as Career Switch OS: one ID + password, no email. */
export function AuthScreen({ onSkip, onRegister, onLogin }: Props) {
  const [mode, setMode] = useState<Mode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'signup') {
        await onRegister(username, password)
        setInfo('Account ready. Sign in with this ID on phone / laptop too.')
      } else {
        await onLogin(username, password)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not authenticate'
      if (/function .* does not exist|PGRST202|life_rpg_/i.test(msg)) {
        setError(
          'Cloud tables not ready yet. Run supabase/life_rpg_sync.sql in Supabase SQL Editor (and Career Switch simple_auth.sql if accounts are new).',
        )
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">LIFE RPG</p>
        <h1>Sign in to sync</h1>
        <p className="lead">
          One <strong>ID + password</strong> — same style as Road to December. Use it on phone and
          laptop (max {MAX_DEVICES} devices). Progress stays shared.
        </p>

        <div className="warn-box">
          Tip: you can reuse the same ID as Career Switch OS if both apps share one Supabase
          project.
        </div>

        {!isSyncConfigured() && (
          <p className="warn-box">
            Cloud keys missing. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file (copy from Career Switch
            OS), then restart <code>npm run dev</code>.
          </p>
        )}

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup')
              setError(null)
              setInfo(null)
            }}
          >
            Create ID
          </button>
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => {
              setMode('signin')
              setError(null)
              setInfo(null)
            }}
          >
            Sign in
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            ID (username)
            <input
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="sangam"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>
          <button
            className="btn btn--primary"
            type="submit"
            disabled={busy || !isSyncConfigured()}
          >
            {busy
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create ID & sync'
                : 'Sign in & sync'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
        {info && <p className="ok-text">{info}</p>}

        <button type="button" className="skip-link" onClick={onSkip}>
          Continue without sync (this device only)
        </button>
      </div>
    </div>
  )
}
