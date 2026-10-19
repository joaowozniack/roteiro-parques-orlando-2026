import { describe, expect, it } from 'vitest'
import { activePark } from '../data/parks'
import { exportState, importState, initialState, moveStep, parseState } from './progress'

describe('backup e recuperação do progresso', () => {
  it('preserva status, prioridades e ordem em uma exportação/importação', () => {
    const state = initialState()
    const progress = state.parks[activePark.id]
    progress.statuses.hagrids = 'later'
    progress.statuses.velocicoaster = 'completed'
    progress.priorities.hulk = 'optional'
    progress.order.reverse()
    expect(importState(exportState(state))).toEqual(state)
  })
  it('recusa backups de outro aplicativo e versões incompatíveis', () => {
    expect(() => importState('{"app":"other"}')).toThrow()
    expect(() => parseState({ version: 2, parks: {} })).toThrow()
    expect(() => importState('broken')).toThrow()
  })
  it('recusa duplicatas, status inválido e IDs desconhecidos', () => {
    const state = initialState()
    const progress = state.parks[activePark.id]
    progress.order.push(progress.order[0])
    expect(() => parseState(state)).toThrow()
    progress.order.pop()
    ;(progress.statuses as Record<string, string>).hulk = 'inventado'
    expect(() => parseState(state)).toThrow()
    progress.statuses.hulk = 'pending'
    progress.order.push('unknown')
    expect(() => parseState(state)).toThrow()
  })
  it('completa etapas novas de versões futuras sem perder o progresso existente', () => {
    const state = initialState()
    const progress = state.parks[activePark.id]
    progress.order = ['velocicoaster']
    progress.statuses = { velocicoaster: 'completed' }
    progress.priorities = { velocicoaster: 'high' }
    const restored = parseState(state).parks[activePark.id]
    expect(restored.order[0]).toBe('velocicoaster')
    expect(restored.order).toHaveLength(11)
    expect(restored.statuses.velocicoaster).toBe('completed')
    expect(restored.statuses.hagrids).toBe('pending')
  })
  it('não aceita valores herdados de protótipos como status', () => {
    const state = initialState()
    ;(state.parks[activePark.id].statuses as Record<string, string>).hulk = 'toString'
    expect(() => parseState(state)).toThrow()
  })
  it('reordena sem alterar os dados e permite restaurar a ordem sugerida', () => {
    const state = initialState(), progress = state.parks[activePark.id]
    const moved = moveStep(progress, 'hagrids', -1)
    expect(moved.order.indexOf('hagrids')).toBe(2)
    expect(progress.order.indexOf('hagrids')).toBe(3)
    expect(moved.statuses).toEqual(progress.statuses)
    expect(moveStep(progress, 'arrival', -1)).toBe(progress)
    expect(moveStep(progress, 'dark-arts', 1)).toBe(progress)
    expect(moveStep(progress, 'unknown', 1)).toBe(progress)
  })
})
