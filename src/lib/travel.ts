import { tripDays } from '../data/travel'
import type { ActivityCategory } from '../types'

export const categoryLabels: Record<ActivityCategory, string> = { travel: 'Deslocamento', stay: 'Hospedagem', shopping: 'Compras', outing: 'Passeio', park: 'Parque', food: 'Alimentação', event: 'Evento' }
export function deviceDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
// Explicit dates belong to manual navigation/deep links. Entry links use #/viagem
// without a date, so every new visit prioritizes today without saved selection.
export function chooseTripDay(today: string, explicit?: string) {
  return tripDays.find(day => day.id === explicit)
    ?? tripDays.find(day => day.date === today)
    ?? tripDays[0]
}
