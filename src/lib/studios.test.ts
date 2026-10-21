import { describe, expect, it } from 'vitest'
import { universalStudios } from '../data/universal-studios'
import { activePark } from '../data/parks'
import { exportState, importState, initialState, itinerarySummary, parseState } from './progress'

const id = universalStudios.id, goal = 'hogwarts-express-hogsmeade'
describe('Studios e objetivos extras', () => {
  it('migra o cadastro vazio do Studios sem tocar nos roteiros ou checklist já usados', () => {
    const state = initialState()
    state.parks[activePark.id].order.reverse()
    state.parks[activePark.id].statuses.hagrids = 'later'
    state.parks['magic-kingdom'].priorities['space-mountain'] = 'optional'
    state.dining[activePark.id]['frozen-butterbeer'] = true
    state.globalChecklist.checked.tickets = true
    state.parks[id] = { order: [], statuses: {}, priorities: {} }
    const { extraGoals: _newDomain, ...legacy } = state
    const original = structuredClone(legacy)
    const migrated = parseState(legacy)
    expect(migrated.parks[activePark.id]).toEqual(state.parks[activePark.id])
    expect(migrated.parks['magic-kingdom']).toEqual(state.parks['magic-kingdom'])
    expect(migrated.dining).toEqual(state.dining)
    expect(migrated.globalChecklist).toEqual(state.globalChecklist)
    expect(migrated.parks[id].order).toEqual(universalStudios.steps.map(step => step.id))
    expect(migrated.extraGoals[id][goal]).toBe('pending')
    expect(legacy).toEqual(original)
  })
  it('conta exatamente 10 experiências, excluindo chegada, almoço e objetivo extra', () => {
    const state = initialState(), progress = state.parks[id]
    progress.statuses['studios-arrival'] = 'completed'
    progress.statuses['studios-lunch'] = 'completed'
    state.extraGoals[id][goal] = 'completed'
    expect(itinerarySummary(universalStudios, progress)).toMatchObject({ total: 10, completed: 0, percent: 0, nextId: 'gringotts' })
    for (const step of universalStudios.steps) progress.statuses[step.id] = 'completed'
    state.extraGoals[id][goal] = 'not_done'
    expect(itinerarySummary(universalStudios, progress).percent).toBe(100)
    expect(itinerarySummary(activePark, state.parks[activePark.id]).percent).toBe(0)
  })
  it('restaura todos os estados do objetivo extra pelo JSON e recusa estados ou IDs desconhecidos', () => {
    const state = initialState()
    for (const status of ['pending', 'completed', 'not_done'] as const) {
      state.extraGoals[id][goal] = status
      expect(importState(exportState(state))).toEqual(state)
    }
    state.extraGoals[id][goal] = 'skipped' as never
    expect(() => parseState(state)).toThrow()
    state.extraGoals[id] = { unknown: 'completed' }
    expect(() => parseState(state)).toThrow()
    state.extraGoals = { unknown: {} }
    expect(() => parseState(state)).toThrow()
  })
  it('mantém a sequência solicitada, sem horários fixos nas atrações e com preços a confirmar', () => {
    expect(universalStudios.steps.map(step => step.id)).toEqual(['studios-arrival', 'gringotts', 'explore-diagon', 'men-in-black', 'simpsons', 'studios-lunch', 'et-adventure', 'bourne', 'minion-mayhem', 'transformers', 'mummy', 'jimmy-fallon'])
    expect(universalStudios.steps.find(step => step.id === 'bourne')?.plannedTime).toBeNull()
    expect(universalStudios.steps.every(step => step.plannedTime == null)).toBe(true)
    expect(universalStudios.closing).toBeUndefined()
    expect(universalStudios.dining).toHaveLength(5)
    expect(universalStudios.dining?.every(item => item.price.includes('confirmar') && !/\d/.test(item.price))).toBe(true)
  })
  it('mantém Hogwarts apenas nas complementares do Islands e como objetivo extra no Studios', () => {
    expect(activePark.steps.some(step => step.name.includes('Hogwarts Express'))).toBe(false)
    expect(activePark.extras.some(extra => extra.name.includes('Hogwarts Express'))).toBe(true)
    expect(activePark.extraGoals).toBeUndefined()
    expect(universalStudios.steps.some(step => step.name.includes('Hogwarts Express'))).toBe(false)
    expect(universalStudios.extraGoals?.[0].destinationParkId).toBe(activePark.id)
  })
})
