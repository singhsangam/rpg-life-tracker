export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function minutesNow(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes()
}

export function parseTimeToMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatMin(min: number): string {
  const m = ((min % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(m / 60)
  const mm = m % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mm.toString().padStart(2, '0')} ${ampm}`
}

export function formatMinShort(min: number): string {
  const m = ((min % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
}

/** Minutes spanning midnight-safe duration */
export function blockDuration(startMin: number, endMin: number): number {
  if (endMin > startMin) return endMin - startMin
  return 24 * 60 - startMin + endMin
}

export function isActiveBlock(startMin: number, endMin: number, nowMin: number): boolean {
  if (endMin > startMin) return nowMin >= startMin && nowMin < endMin
  return nowMin >= startMin || nowMin < endMin
}

export function isWeekend(d = new Date()): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

export type DayHalf = 'am' | 'pm'

export function currentHalf(nowMin = minutesNow()): DayHalf {
  return nowMin < 12 * 60 ? 'am' : 'pm'
}

/** Expand a block into contiguous segments in [0, 1440). */
export function expandBlockSegments(
  startMin: number,
  endMin: number,
): Array<{ start: number; end: number }> {
  if (endMin > startMin) return [{ start: startMin, end: endMin }]
  if (endMin === startMin) return []
  return [
    { start: startMin, end: 24 * 60 },
    { start: 0, end: endMin },
  ]
}

/** Clip a 24h block into one half of the day for a normal 12-hour clock face. */
export function clipBlockToHalf(
  startMin: number,
  endMin: number,
  half: DayHalf,
): Array<{ start: number; end: number }> {
  const lo = half === 'am' ? 0 : 12 * 60
  const hi = half === 'am' ? 12 * 60 : 24 * 60
  const out: Array<{ start: number; end: number }> = []
  for (const seg of expandBlockSegments(startMin, endMin)) {
    const start = Math.max(seg.start, lo)
    const end = Math.min(seg.end, hi)
    if (end > start) out.push({ start, end })
  }
  return out
}

/** Normal clock: 12 at top, clockwise, over a 12-hour span. */
export function halfMinToAngle(absoluteMin: number, half: DayHalf): number {
  const local = half === 'am' ? absoluteMin : absoluteMin - 12 * 60
  return (local / (12 * 60)) * 360 - 90
}

export function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function describeHalfArc(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startMin: number,
  endMin: number,
  half: DayHalf,
): string {
  let duration = endMin - startMin
  if (duration <= 0) return ''
  if (duration >= 12 * 60 - 0.5) duration = 12 * 60 - 0.5

  const startA = halfMinToAngle(startMin, half)
  const endA = halfMinToAngle(startMin + duration, half)
  const large = duration > 6 * 60 ? 1 : 0

  const p1 = polar(cx, cy, rOuter, startA)
  const p2 = polar(cx, cy, rOuter, endA)
  const p3 = polar(cx, cy, rInner, endA)
  const p4 = polar(cx, cy, rInner, startA)

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

export function midHalfLabelPoint(
  cx: number,
  cy: number,
  r: number,
  startMin: number,
  endMin: number,
  half: DayHalf,
) {
  const mid = startMin + (endMin - startMin) / 2
  return polar(cx, cy, r, halfMinToAngle(mid, half))
}
