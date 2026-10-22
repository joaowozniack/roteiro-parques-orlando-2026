import { describe, expect, it } from 'vitest'
import { tripDays } from '../data/travel'
import { parks } from '../data/parks'
import { chooseTripDay, deviceDay } from './travel'
import { exportState, importState, initialState, parseState } from './progress'

describe('roteiro diário informativo', () => {
  it('mantém 14 dias, 45 atividades estáticas e somente os horários fornecidos', () => {
    expect(tripDays).toHaveLength(14)
    expect(tripDays[0].id).toBe('2026-10-27')
    expect(tripDays.at(-1)?.id).toBe('2026-11-09')
    expect(tripDays.flatMap(day => day.activities).filter(activity => activity.time).map(activity => activity.time)).toEqual(['15:00', '16:00'])
    expect(new Set(tripDays.flatMap(day => day.activities).map(activity => activity.id)).size).toBe(45)
    expect(tripDays.flatMap(day => day.activities).filter(activity => activity.linkedParkId).map(activity => activity.linkedParkId)).toEqual(parks.map(park => park.id))
  })
  it('ignora qualquer progresso diário antigo sem afetar os demais domínios', () => {
    const state = initialState()
    state.parks['islands-of-adventure'].statuses.hagrids = 'later'
    state.parks['magic-kingdom'].order.reverse()
    state.globalChecklist.checked.tickets = true
    state.dining['epic-universe']['mead-hall'] = true
    state.extraGoals['universal-studios']['hogwarts-express-hogsmeade'] = 'completed'
    const legacy = { ...state, trip: { selectedDay: '2026-11-07', days: { '2026-10-27': { hidden: ['curitiba-airport'], statuses: { 'curitiba-airport': 'completed' }, edits: { 'curitiba-airport': { name: 'Texto antigo' } } } } } }
    const copy = structuredClone(legacy)
    expect(parseState(legacy)).toEqual(state)
    expect(legacy).toEqual(copy)
    expect(parseState({ ...state, trip: 'legado inválido' })).toEqual(state)
  })
  it('mantém backups dos parques e inclui somente a referência estática da agenda', () => {
    const state = initialState()
    const backup = JSON.parse(exportState(state))
    expect(backup.progress).not.toHaveProperty('trip')
    expect(backup.tripItinerary).toEqual(tripDays)
    expect(importState(exportState(state))).toEqual(state)
    backup.progress.trip = { days: { malicious: { status: 'toString' } } }
    expect(importState(JSON.stringify(backup))).toEqual(state)
  })
  it('prioriza hoje a cada entrada e respeita datas explícitas durante a navegação manual', () => {
    for (const day of tripDays) expect(chooseTripDay(day.date).id).toBe(day.id)
    expect(chooseTripDay('2026-11-02', '2026-11-07').id).toBe('2026-11-07')
    expect(chooseTripDay('2026-11-03', '2026-11-07').id).toBe('2026-11-07')
    expect(chooseTripDay('2026-11-03').id).toBe('2026-11-03')
    expect(chooseTripDay('2026-10-22').id).toBe('2026-10-27')
    expect(chooseTripDay('2026-12-01', 'invalid').id).toBe('2026-10-27')
  })
  it('usa a data local sem conversão UTC', () => {
    expect(deviceDay(new Date(2026, 10, 2, 0, 30))).toBe('2026-11-02')
    expect(deviceDay(new Date(2026, 9, 27, 23, 59))).toBe('2026-10-27')
  })
})
