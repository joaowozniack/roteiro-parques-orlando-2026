import { describe, expect, it } from 'vitest'
import { parks } from '../data/parks'
import { initialState } from './progress'
import { orlandoDay, selectFeaturedPark } from './featured'

const islands = 'islands-of-adventure', magic = 'magic-kingdom', studios = 'universal-studios'
describe('destaque da viagem', () => {
  it('exibe o primeiro parque antes da viagem e no dia da visita', () => {
    expect(selectFeaturedPark(parks, initialState(), '2026-10-20')?.id).toBe(islands)
    expect(selectFeaturedPark(parks, initialState(), '2026-10-30')?.id).toBe(islands)
  })
  it('mostra o próximo parque nos intervalos e no seu dia, mesmo com pendências anteriores', () => {
    expect(selectFeaturedPark(parks, initialState(), '2026-10-31')?.id).toBe(magic)
    expect(selectFeaturedPark(parks, initialState(), '2026-11-01')?.id).toBe(magic)
  })
  it('avança com 100%, mas não com uma etapa apenas pulada ou para voltar', () => {
    const state = initialState()
    for (const id of state.parks[islands].order) state.parks[islands].statuses[id] = 'completed'
    expect(selectFeaturedPark(parks, state, '2026-10-20')?.id).toBe(magic)
    state.parks[islands].statuses.hagrids = 'later'
    expect(selectFeaturedPark(parks, state, '2026-10-20')?.id).toBe(islands)
    state.parks[islands].statuses.hagrids = 'skipped'
    expect(selectFeaturedPark(parks, state, '2026-10-20')?.id).toBe(islands)
  })
  it('mantém o último parque para revisão após todos concluírem ou após a última data', () => {
    const state = initialState()
    for (const progress of Object.values(state.parks)) for (const id of progress.order) progress.statuses[id] = 'completed'
    expect(selectFeaturedPark(parks, state, '2026-10-20')?.id).toBe('epic-universe')
    expect(selectFeaturedPark(parks, state, '2026-11-04')?.id).toBe('epic-universe')
    expect(selectFeaturedPark(parks, initialState(), '2026-11-04')?.id).toBe('epic-universe')
  })
  it('avança para Studios em 02/11 ou após concluir os parques anteriores', () => {
    const state = initialState()
    expect(selectFeaturedPark(parks, state, '2026-11-02')?.id).toBe(studios)
    expect(selectFeaturedPark(parks, state, '2026-11-03')?.id).toBe(studios)
    for (const parkId of [islands, magic]) for (const id of state.parks[parkId].order) state.parks[parkId].statuses[id] = 'completed'
    expect(selectFeaturedPark(parks, state, '2026-10-20')?.id).toBe(studios)
  })
  it('não altera a ordem cadastrada, ignora parques sem roteiro e lida com lista vazia', () => {
    const ids = parks.map(park => park.id)
    selectFeaturedPark(parks, initialState(), '2026-10-31')
    expect(parks.map(park => park.id)).toEqual(ids)
    expect(selectFeaturedPark([], initialState(), '2026-10-20')).toBeUndefined()
  })
  it('usa o dia de Orlando, inclusive na virada da meia-noite e no horário de verão', () => {
    expect(orlandoDay(new Date('2026-11-01T02:30:00Z'))).toBe('2026-10-31')
    expect(orlandoDay(new Date('2026-11-01T04:00:00Z'))).toBe('2026-11-01')
    expect(orlandoDay(new Date('2026-11-02T04:30:00Z'))).toBe('2026-11-01')
    expect(orlandoDay(new Date('2026-11-02T05:00:00Z'))).toBe('2026-11-02')
  })
})
