import { describe, expect, it } from 'vitest'
import { epicUniverse as epic } from '../data/epic-universe'
import { parks } from '../data/parks'
import { exportState, importState, initialProgress, initialState, itinerarySummary, parseState } from './progress'
import { selectFeaturedPark } from './featured'

describe('Epic Universe', () => {
  it('mantém a sequência, refeições e complementares separados e sessões sem horário inventado', () => {
    expect(epic.steps.map(s => s.id)).toEqual(['epic-arrival', 'mario-kart', 'mine-cart', 'wing-gliders', 'untrainable-dragon', 'epic-lunch', 'monsters-unchained', 'werewolf', 'stardust-first', 'explore-ministry', 'cirque-arcanus', 'battle-ministry', 'stardust-night', 'celestial-goodnight'])
    expect(epic.steps.filter(s => s.plannedTime === null).map(s => s.id)).toEqual(['untrainable-dragon', 'cirque-arcanus', 'celestial-goodnight'])
    expect(epic.extras).toHaveLength(5)
    expect(epic.dining).toHaveLength(8)
    expect(epic.dining!.every(food => food.price.includes('confirmar'))).toBe(true)
    expect(epic.steps.filter(s => s.detailNotice)).toHaveLength(3)
  })
  it('conta Stardust uma vez, ignora chegada/almoço e não exige repetição', () => {
    const progress = initialProgress(epic)
    progress.statuses['epic-arrival'] = progress.statuses['epic-lunch'] = 'completed'
    expect(itinerarySummary(epic, progress)).toMatchObject({ total: 11, completed: 0, nextId: 'mario-kart' })
    progress.statuses['stardust-night'] = 'completed'
    expect(itinerarySummary(epic, progress).completed).toBe(1)
    progress.statuses['stardust-first'] = 'completed'
    expect(itinerarySummary(epic, progress).completed).toBe(1)
  })
  it('indisponibilidade exclui apenas o show condicional e permite 100%, pulada não exclui', () => {
    const progress = initialProgress(epic)
    for (const step of epic.steps) progress.statuses[step.id] = 'completed'
    progress.statuses['stardust-night'] = 'pending'
    progress.statuses['celestial-goodnight'] = 'unavailable'
    expect(itinerarySummary(epic, progress)).toMatchObject({ completed: 10, total: 10, percent: 100, nextId: undefined })
    progress.statuses['celestial-goodnight'] = 'skipped'
    expect(itinerarySummary(epic, progress)).toMatchObject({ completed: 10, total: 11, percent: 91 })
  })
  it('migra Epic vazio preservando integralmente os outros domínios', () => {
    const old = initialState()
    old.parks[epic.id] = { order: [], statuses: {}, priorities: {} }
    old.parks['islands-of-adventure'].statuses.hagrids = 'later'
    old.parks['magic-kingdom'].order.reverse()
    old.extraGoals['universal-studios']['hogwarts-express-hogsmeade'] = 'completed'
    old.globalChecklist.customTasks.push({ id: 'personal-epic', name: 'Mochila' })
    old.globalChecklist.checked['personal-epic'] = true
    const migrated = parseState(old)
    for (const id of ['islands-of-adventure', 'magic-kingdom', 'universal-studios']) expect(migrated.parks[id]).toEqual(old.parks[id])
    expect(migrated.globalChecklist).toEqual(old.globalChecklist)
    expect(migrated.extraGoals).toEqual(old.extraGoals)
    expect(migrated.parks[epic.id]).toEqual(initialProgress(epic))
  })
  it('exporta disponibilidade e alimentação; rejeita indisponibilidade em atração não habilitada', () => {
    const state = initialState()
    state.parks[epic.id].statuses['celestial-goodnight'] = 'unavailable'
    state.dining[epic.id]['mead-hall'] = true
    expect(importState(exportState(state))).toEqual(state)
    state.parks[epic.id].statuses['mario-kart'] = 'unavailable'
    expect(() => parseState(state)).toThrow('não permite')
  })
  it('destaca Epic no intervalo, no dia e ao concluir os parques anteriores', () => {
    const state = initialState()
    for (const date of ['2026-11-04', '2026-11-05']) expect(selectFeaturedPark(parks, state, date)?.id).toBe(epic.id)
    for (const park of parks.filter(p => p.id !== epic.id)) for (const id of state.parks[park.id].order) state.parks[park.id].statuses[id] = 'completed'
    expect(selectFeaturedPark(parks, state, '2026-10-21')?.id).toBe(epic.id)
  })
})
