import { useEffect, useId, useMemo, useState } from 'react'
import {
  clipBlockToHalf,
  currentHalf,
  describeHalfArc,
  formatMin,
  halfMinToAngle,
  isActiveBlock,
  midHalfLabelPoint,
  minutesNow,
  polar,
  type DayHalf,
} from '../lib/time'
import type { TimeBlock } from '../types'

type Props = {
  title: string
  subtitle?: string
  half: DayHalf
  blocks: TimeBlock[]
  /** Only the clock matching current day-type + AM/PM should be live */
  live?: boolean
  onSelect: (block: TimeBlock) => void
  onCheckIn: (blockId: string) => void
}

const SIZE = 360
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUTER = 138
const R_INNER = 66
const R_TICK_OUTER = R_OUTER + 4
const R_TICK_INNER = R_OUTER - 8
const R_LABEL = R_OUTER + 24

export function RoutineWheel({
  title,
  subtitle,
  half,
  blocks,
  live,
  onSelect,
  onCheckIn,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const [now, setNow] = useState(() => minutesNow())

  useEffect(() => {
    const id = window.setInterval(() => setNow(minutesNow()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  const slices = useMemo(() => {
    const out: Array<{
      key: string
      block: TimeBlock
      start: number
      end: number
      path: string
      labelPt: { x: number; y: number }
      active: boolean
    }> = []

    for (const block of blocks) {
      const parts = clipBlockToHalf(block.startMin, block.endMin, half)
      parts.forEach((part, i) => {
        const path = describeHalfArc(CX, CY, R_INNER, R_OUTER, part.start, part.end, half)
        if (!path) return
        out.push({
          key: `${block.id}-${i}`,
          block,
          start: part.start,
          end: part.end,
          path,
          labelPt: midHalfLabelPoint(
            CX,
            CY,
            (R_INNER + R_OUTER) / 2,
            part.start,
            part.end,
            half,
          ),
          active: live ? isActiveBlock(block.startMin, block.endMin, now) : false,
        })
      })
    }
    return out
  }, [blocks, half, live, now])

  const activeBlock = useMemo(() => {
    if (!live) return undefined
    return blocks.find((b) => isActiveBlock(b.startMin, b.endMin, now))
  }, [blocks, live, now])

  const showNeedle = live && currentHalf(now) === half
  const needleMin = half === 'am' ? now : now
  const needle = polar(CX, CY, R_OUTER + 8, halfMinToAngle(needleMin, half))

  // Full 12-hour face: 12, 1, 2, … 11 (not only cardinals)
  const labels = Array.from({ length: 12 }, (_, i) => {
    const hour = i === 0 ? 12 : i
    const absMin = (half === 'am' ? 0 : 12 * 60) + i * 60
    return { t: String(hour), min: absMin }
  })

  return (
    <section className={`wheel-card ${live ? 'wheel-card--active' : 'wheel-card--dim'}`}>
      <header className="wheel-card__head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted wheel-sub">{subtitle}</p>}
        </div>
        {live && <span className="pill pill--live">Live now</span>}
      </header>

      <div className="wheel-stage">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="wheel-svg" role="img" aria-label={title}>
          <defs>
            <pattern
              id={`hatch-${uid}`}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
            </pattern>
            <filter id={`glow-${uid}`}>
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={CX}
            cy={CY}
            r={R_OUTER + 6}
            className="wheel-ring"
            filter={live ? `url(#glow-${uid})` : undefined}
          />
          <line x1={CX} y1={22} x2={CX} y2={SIZE - 22} className="wheel-guide" />
          <line x1={22} y1={CY} x2={SIZE - 22} y2={CY} className="wheel-guide" />

          {labels.map((l) => {
            const outer = polar(CX, CY, R_TICK_OUTER, halfMinToAngle(l.min, half))
            const inner = polar(CX, CY, R_TICK_INNER, halfMinToAngle(l.min, half))
            return (
              <line
                key={`tick-${l.min}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                className="hour-tick"
              />
            )
          })}

          {slices.map((slice) => {
            const showLabel =
              slice.block.category !== 'free' && slice.end - slice.start >= 40
            return (
              <g key={slice.key} className={`slice ${slice.active ? 'slice--active' : ''}`}>
                <path
                  d={slice.path}
                  fill={slice.block.color}
                  opacity={slice.block.category === 'free' ? 0.12 : live ? 0.92 : 0.55}
                  onClick={() => onSelect(slice.block)}
                  className="slice-path"
                />
                <path
                  d={slice.path}
                  fill={`url(#hatch-${uid})`}
                  pointerEvents="none"
                  opacity={live ? 1 : 0.45}
                />
                {showLabel && (
                  <text
                    x={slice.labelPt.x}
                    y={slice.labelPt.y}
                    className="slice-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    onClick={() => onSelect(slice.block)}
                  >
                    {slice.block.label.length > 11
                      ? `${slice.block.label.slice(0, 10)}…`
                      : slice.block.label}
                  </text>
                )}
              </g>
            )
          })}

          <circle cx={CX} cy={CY} r={R_INNER - 4} className="wheel-hub" />
          <text x={CX} y={CY - 10} className="hub-title" textAnchor="middle">
            {half === 'am' ? 'MORNING' : 'AFTERNOON'}
          </text>
          <text x={CX} y={CY + 12} className="hub-time" textAnchor="middle">
            {live ? formatMin(now) : half === 'am' ? '12–12' : '12–12'}
          </text>

          {showNeedle && (
            <>
              <line
                x1={CX}
                y1={CY}
                x2={needle.x}
                y2={needle.y}
                className="now-needle"
                filter={`url(#glow-${uid})`}
              />
              <circle cx={CX} cy={CY} r={4} className="now-dot" />
            </>
          )}

          {labels.map((l) => {
            const p = polar(CX, CY, R_LABEL, halfMinToAngle(l.min, half))
            return (
              <text
                key={l.t + l.min}
                x={p.x}
                y={p.y}
                className="clock-label"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {l.t}
              </text>
            )
          })}
        </svg>
      </div>

      {live && activeBlock && (
        <div className="active-block-bar">
          <div>
            <p className="eyebrow">Active block</p>
            <strong>{activeBlock.label}</strong>
            <span>
              {formatMin(activeBlock.startMin)} – {formatMin(activeBlock.endMin)} ·{' '}
              {activeBlock.xp} XP
            </span>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onCheckIn(activeBlock.id)}
          >
            Check-In
          </button>
        </div>
      )}
    </section>
  )
}
