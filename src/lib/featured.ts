import type { GuideState, Park } from '../types'
import { itinerarySummary } from './progress'

export function orlandoDay(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const part = (name: string) => parts.find(item => item.type === name)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function selectFeaturedPark(parks: Park[], state: GuideState, day: string): Park | undefined {
  const ready = parks.filter(park => park.steps.length > 0)
    .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
  // The visit date advances the trip even if earlier items remain pending.
  // Completion can advance it sooner; never promote an unregistered itinerary.
  const upcoming = ready.filter(park => !park.date || park.date >= day)
  const remaining = upcoming.find(park => {
    const summary = itinerarySummary(park, state.parks[park.id])
    return summary.completed < summary.total
  })
  // When the scheduled trip has ended, keep its last park available to review.
  return remaining ?? upcoming.at(-1) ?? ready.at(-1)
}
