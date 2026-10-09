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

const SIZE = 340
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUTER = 138
const R_INNER = 66

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

  const labels =
    half === 'am'
      ? [
          { t: '12', min: 0 },
          { t: '3', min: 3 * 60 },
          { t: '6', min: 6 * 60 },
          { t: '9', min: 9 * 60 },
        ]
      : [
          { t: '12', min: 12 * 60 },
          { t: '3', min: 15 * 60 },
          { t: '6', min: 18 * 60 },
          { t: '9', min: 21 * 60 },
        ]

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
          <line x1={CX} y1={18} x2={CX} y2={SIZE - 18} className="wheel-guide" />
          <line x1={18} y1={CY} x2={SIZE - 18} y2={CY} className="wheel-guide" />

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
            const p = polar(CX, CY, R_OUTER + 20, halfMinToAngle(l.min, half))
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
