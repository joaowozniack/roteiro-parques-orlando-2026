import { describe, expect, it } from 'vitest'
import { tripDays } from '../data/travel'
import { parks } from '../data/parks'
import { chooseTripDay, deleteActivity, deviceDay, editActivity, emptyTripDay, moveActivity, parseTripProgress, tripActivities, tripDaySummary } from './travel'
import { exportState, importState, initialState, parseState } from './progress'

describe('cronograma da viagem', () => {
  it('cadastra 14 dias, somente horários fornecidos e links para os quatro parques reais', () => {
    expect(tripDays).toHaveLength(14)
    expect(tripDays[0].id).toBe('2026-10-27')
    expect(tripDays.at(-1)?.id).toBe('2026-11-09')
    expect(tripDays.flatMap(day => day.activities).filter(activity => activity.time).map(activity => activity.time)).toEqual(['15:00', '16:00'])
    expect(tripDays.flatMap(day => day.activities).filter(activity => activity.linkedParkId).map(activity => activity.linkedParkId)).toEqual(parks.map(park => park.id))
    expect(new Set(tripDays.flatMap(day => day.activities).map(activity => activity.id)).size).toBe(45)
  })
  it('migra backups antigos sem sobrescrever parques, alimentação, checklist ou objetivos', () => {
    const state = initialState()
    state.parks['islands-of-adventure'].statuses.hagrids = 'later'
    state.parks['magic-kingdom'].order.reverse()
    state.globalChecklist.checked.tickets = true
    state.extraGoals['universal-studios']['hogwarts-express-hogsmeade'] = 'completed'
    const { trip: _trip, ...old } = state
    const copy = structuredClone(old)
    expect(parseState(old)).toEqual({ ...old, trip: { days: {} } })
    expect(old).toEqual(copy)
  })
  it('mantém o progresso do dia independente, com opcionais e ocultas fora da contagem', () => {
    const day = tripDays.find(day => day.id === '2026-11-03')!, progress = emptyTripDay()
    progress.statuses['try-hogwarts'] = 'completed'
    expect(tripDaySummary(day, progress)).toEqual({ completed: 0, total: 2, percent: 0 })
    progress.statuses['visit-studios'] = 'completed'
    progress.statuses.citywalk = 'skipped'
    expect(tripDaySummary(day, progress)).toEqual({ completed: 1, total: 2, percent: 50 })
    progress.hidden = ['citywalk']
    expect(tripDaySummary(day, progress)).toEqual({ completed: 1, total: 1, percent: 100 })
    progress.hidden.push('visit-studios')
    expect(tripDaySummary(day, progress).percent).toBe(0)
  })
  it('salva só alterações dos textos, permite limpar campos e preserva vínculos e opcionais', () => {
    const day = tripDays[0], progress = emptyTripDay(), original = day.activities[0]
    const edited = editActivity(day, progress, original.id, { name: original.name, category: original.category, time: '', notes: 'Portão a confirmar' })
    expect(edited.edits[original.id]).toEqual({ time: '', notes: 'Portão a confirmar' })
    expect(tripActivities(day, edited)[0].time).toBe('')
    expect(original.time).toBe('15:00')
    expect(editActivity(day, edited, original.id, { name: original.name, category: original.category, time: '15:00', notes: '' }).edits).toEqual({})
  })
  it('reordena manualmente sem ordenar por horário e limpa referências ao excluir personalizadas', () => {
    const day = tripDays[0], progress = emptyTripDay()
    progress.customActivities.push({ id: 'trip-personal-test', name: 'Café', category: 'food', time: '08:00' })
    expect(tripActivities(day, progress).at(-1)?.name).toBe('Café')
    const moved = moveActivity(day, progress, 'trip-personal-test', -1)
    expect(moved.order).toEqual(['curitiba-airport', 'trip-personal-test', 'outbound-flight'])
    moved.statuses['trip-personal-test'] = 'completed'
    expect(deleteActivity(moved, 'trip-personal-test').order).toEqual(['curitiba-airport', 'outbound-flight'])
    expect(deleteActivity(moved, 'trip-personal-test').statuses).toEqual({})
    expect(progress.order).toBeUndefined()
  })
  it('restaura cronograma completo pelo JSON e ignora dados de referência como fonte executável', () => {
    const state = initialState(), progress = emptyTripDay()
    state.trip = { selectedDay: '2026-11-07', viewedOn: '2026-11-07', days: { '2026-11-07': progress } }
    progress.customActivities.push({ id: 'trip-personal-meet', name: 'Encontro', category: 'outing', notes: '<script>alert(1)</script>' })
    progress.order = ['inter-miami', 'miami-outing', 'dinner-07', 'trip-personal-meet']
    progress.statuses['inter-miami'] = 'skipped'
    progress.edits['inter-miami'] = { notes: 'Participantes: a definir' }
    progress.hidden = ['dinner-07']
    expect(importState(exportState(state))).toEqual(state)
    expect(parseTripProgress({ days: {} })).toEqual({ days: {} })
  })
  it('recusa IDs, horários, categorias e estados inválidos sem substituir o estado anterior', () => {
    const state = initialState(), progress = emptyTripDay()
    state.trip.days['2026-10-27'] = progress
    progress.statuses['curitiba-airport'] = 'later' as never
    expect(() => parseState(state)).toThrow('cronograma')
    progress.statuses = {}
    progress.edits['curitiba-airport'] = { time: '25:00' }
    expect(() => parseState(state)).toThrow('cronograma')
    progress.edits['curitiba-airport'] = { category: 'toString' as never }
    expect(() => parseState(state)).toThrow('cronograma')
    progress.edits = {}
    progress.hidden.push('fake')
    expect(() => parseState(state)).toThrow('cronograma')
    progress.hidden = []
    progress.customActivities.push({ id: 'curitiba-airport', name: 'Duplicada', category: 'outing' })
    expect(() => parseState(state)).toThrow('cronograma')
  })
  it('escolhe o dia local, respeita navegação explícita/manual e recupera seleção fora da viagem', () => {
    expect(deviceDay(new Date(2026, 10, 2, 0, 30))).toBe('2026-11-02')
    expect(chooseTripDay({ days: {} }, '2026-11-02').id).toBe('2026-11-02')
    const saved = { days: {}, selectedDay: '2026-11-07', viewedOn: '2026-11-02' }
    expect(chooseTripDay(saved, '2026-11-02').id).toBe('2026-11-07')
    expect(chooseTripDay(saved, '2026-11-03').id).toBe('2026-11-03')
    expect(chooseTripDay(saved, '2026-11-03', '2026-10-27').id).toBe('2026-10-27')
    expect(chooseTripDay(saved, '2026-12-01').id).toBe('2026-11-07')
    expect(chooseTripDay({ days: {} }, '2026-10-22', 'invalid').id).toBe('2026-10-27')
  })
})
