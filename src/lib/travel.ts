import { tripDays } from '../data/travel'
import type { ActivityCategory, ActivityFields, ActivityStatus, TripActivity, TripDay, TripDayProgress, TripProgress } from '../types'

export const categoryLabels: Record<ActivityCategory, string> = { travel: 'Deslocamento', stay: 'Hospedagem', shopping: 'Compras', outing: 'Passeio', park: 'Parque', food: 'Alimentação', event: 'Evento' }
export const activityStatusLabels: Record<ActivityStatus, string> = { pending: 'Pendente', completed: 'Concluída', skipped: 'Pulada' }
export const emptyTripDay = (): TripDayProgress => ({ statuses: {}, edits: {}, customActivities: [], hidden: [] })
export function deviceDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function chooseTripDay(progress: TripProgress, today: string, explicit?: string) {
  return tripDays.find(day => day.id === explicit)
    ?? (progress.viewedOn === today ? tripDays.find(day => day.id === progress.selectedDay) : undefined)
    ?? tripDays.find(day => day.date === today)
    ?? tripDays.find(day => day.id === progress.selectedDay)
    ?? tripDays[0]
}
export function tripActivities(day: TripDay, progress = emptyTripDay()) {
  const all = [...day.activities.map(activity => ({ ...activity, ...progress.edits[activity.id] })), ...progress.customActivities]
  const order = progress.order ?? all.map(activity => activity.id)
  return [...order, ...all.map(activity => activity.id).filter(id => !order.includes(id))]
    .map(id => all.find(activity => activity.id === id)).filter((activity): activity is TripActivity => !!activity)
}
export function tripDaySummary(day: TripDay, progress = emptyTripDay()) {
  const counted = tripActivities(day, progress).filter(activity => !progress.hidden.includes(activity.id) && !activity.optional)
  const completed = counted.filter(activity => progress.statuses[activity.id] === 'completed').length
  return { completed, total: counted.length, percent: counted.length ? Math.round(completed / counted.length * 100) : 0 }
}
export function moveActivity(day: TripDay, progress: TripDayProgress, id: string, direction: -1 | 1): TripDayProgress {
  const order = tripActivities(day, progress).map(activity => activity.id)
  const visible = order.filter(id => !progress.hidden.includes(id))
  const index = visible.indexOf(id), target = visible[index + direction]
  if (index < 0 || !target) return progress
  const a = order.indexOf(id), b = order.indexOf(target)
  ;[order[a], order[b]] = [order[b], order[a]]
  return { ...progress, order }
}
export function editActivity(day: TripDay, progress: TripDayProgress, id: string, fields: ActivityFields): TripDayProgress {
  const original = day.activities.find(activity => activity.id === id)
  if (!original) return { ...progress, customActivities: progress.customActivities.map(activity => activity.id === id ? { ...activity, ...fields } : activity) }
  // Only store differences; clearing an original field is represented by ''.
  const delta = Object.fromEntries(Object.entries(fields).filter(([key, value]) => value !== (original[key as keyof ActivityFields] ?? '')))
  const edits = { ...progress.edits }
  if (Object.keys(delta).length) edits[id] = delta
  else delete edits[id]
  return { ...progress, edits }
}
export function deleteActivity(progress: TripDayProgress, id: string): TripDayProgress {
  const statuses = { ...progress.statuses }; delete statuses[id]
  return { ...progress, customActivities: progress.customActivities.filter(activity => activity.id !== id), order: progress.order?.filter(item => item !== id), statuses }
}

const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const invalid = () => new Error('O cronograma contém dados inválidos. Use um backup exportado pelo guia.')
function parseFields(raw: unknown, partial = false): Partial<ActivityFields> {
  if (!object(raw)) throw invalid()
  const result: Record<string, string> = {}
  for (const [key, max] of Object.entries({ name: 140, description: 1000, time: 5, location: 240, notes: 1500 })) {
    if (raw[key] === undefined) continue
    if (typeof raw[key] !== 'string' || raw[key].length > max || (key === 'name' && !raw[key].trim()) || (key === 'time' && raw[key] !== '' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(raw[key]))) throw invalid()
    result[key] = raw[key]
  }
  if (raw.category !== undefined) {
    if (typeof raw.category !== 'string' || !Object.hasOwn(categoryLabels, raw.category)) throw invalid()
    result.category = raw.category
  }
  if (!partial && (!result.name || !result.category)) throw invalid()
  return result as Partial<ActivityFields>
}
export function parseTripProgress(value: unknown): TripProgress {
  if (value === undefined) return { days: {} }
  if (!object(value) || !object(value.days)) throw invalid()
  const result: TripProgress = { days: {} }
  if (value.selectedDay !== undefined) {
    if (typeof value.selectedDay !== 'string' || !tripDays.some(day => day.id === value.selectedDay)) throw invalid()
    result.selectedDay = value.selectedDay
  }
  if (value.viewedOn !== undefined) {
    if (typeof value.viewedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.viewedOn)) throw invalid()
    result.viewedOn = value.viewedOn
  }
  for (const [dayId, raw] of Object.entries(value.days)) {
    const day = tripDays.find(day => day.id === dayId)
    if (!day || !object(raw) || !Array.isArray(raw.customActivities) || raw.customActivities.length > 100 || !object(raw.statuses) || !object(raw.edits) || !Array.isArray(raw.hidden)) throw invalid()
    const progress = emptyTripDay()
    const original = new Set(day.activities.map(activity => activity.id)), known = new Set(original)
    progress.customActivities = raw.customActivities.map(activity => {
      if (!object(activity) || typeof activity.id !== 'string' || !/^trip-personal-[a-zA-Z0-9-]{1,80}$/.test(activity.id) || known.has(activity.id)) throw invalid()
      known.add(activity.id)
      // Custom content cannot inject links or change optional/park semantics.
      return { id: activity.id, ...parseFields(activity) } as TripActivity
    })
    if (raw.order !== undefined) {
      if (!Array.isArray(raw.order) || raw.order.some(id => typeof id !== 'string' || !known.has(id)) || new Set(raw.order).size !== raw.order.length) throw invalid()
      const order = raw.order as string[]
      progress.order = [...order, ...[...known].filter(id => !order.includes(id))]
    }
    for (const [id, status] of Object.entries(raw.statuses)) {
      if (!known.has(id) || typeof status !== 'string' || !Object.hasOwn(activityStatusLabels, status)) throw invalid()
      progress.statuses[id] = status as ActivityStatus
    }
    for (const [id, edit] of Object.entries(raw.edits)) {
      if (!original.has(id)) throw invalid()
      progress.edits[id] = parseFields(edit, true)
    }
    if (raw.hidden.some(id => typeof id !== 'string' || !original.has(id)) || new Set(raw.hidden).size !== raw.hidden.length) throw invalid()
    progress.hidden = raw.hidden as string[]
    result.days[dayId] = progress
  }
  return result
}
