import type { LifeScores } from '../types'

const KEYS: (keyof LifeScores)[] = [
  'mood',
  'energy',
  'health',
  'learning',
  'finance',
  'social',
  'career',
  'discipline',
]

function point(cx: number, cy: number, r: number, i: number, n: number) {
  const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / n
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

type Props = {
  scores: LifeScores
  onChange?: (key: keyof LifeScores, value: number) => void
  editable?: boolean
}

export function LifeRadar({ scores, onChange, editable }: Props) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const maxR = 78
  const n = KEYS.length

  const overall =
    KEYS.reduce((sum, k) => sum + scores[k], 0) / KEYS.length

  const poly = KEYS.map((k, i) => {
    const p = point(cx, cy, (scores[k] / 10) * maxR, i, n)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <section className="panel">
      <header className="panel__head">
        <h2>Life Scores</h2>
        <span className="pill">Overall {overall.toFixed(1)}</span>
      </header>

      <div className="radar-wrap">
        <svg viewBox={`0 0 ${size} ${size}`} className="radar">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon
              key={f}
              points={KEYS.map((_, i) => {
                const p = point(cx, cy, maxR * f, i, n)
                return `${p.x},${p.y}`
              }).join(' ')}
              className="radar-grid"
            />
          ))}
          {KEYS.map((k, i) => {
            const p = point(cx, cy, maxR + 18, i, n)
            return (
              <text key={k} x={p.x} y={p.y} className="radar-label" textAnchor="middle" dominantBaseline="middle">
                {k}
              </text>
            )
          })}
          <polygon points={poly} className="radar-fill" />
        </svg>
      </div>

      {editable && onChange && (
        <div className="score-sliders">
          {KEYS.map((k) => (
            <label key={k}>
              <span>
                {k} <em>{scores[k]}</em>
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={scores[k]}
                onChange={(e) => onChange(k, Number(e.target.value))}
              />
            </label>
          ))}
        </div>
      )}
    </section>
  )
}
