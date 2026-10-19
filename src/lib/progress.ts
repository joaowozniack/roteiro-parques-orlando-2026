import { parks } from '../data/parks'
import type { GuideState, Park, ParkProgress, Priority, StepStatus } from '../types'
export const STORAGE_KEY = `orlando-guide:${import.meta.env.BASE_URL}:progress:v1`
export const priorityLabels: Record<Priority, string> = { essential: 'Essencial', high: 'Alta prioridade', optional: 'Opcional' }
export const statusLabels: Record<StepStatus, string> = { pending: 'Pendente', completed: 'Concluída', skipped: 'Pulada', later: 'Voltar depois' }
export function initialProgress(park: Park): ParkProgress {
  return { order: park.steps.map(s => s.id), statuses: Object.fromEntries(park.steps.map(s => [s.id, 'pending'])), priorities: Object.fromEntries(park.steps.map(s => [s.id, s.priority])) }
}
export function initialState(): GuideState {
  return {
    version: 1,
    parks: Object.fromEntries(parks.map(p => [p.id, initialProgress(p)])),
    preparation: Object.fromEntries(parks.map(p => [p.id, {}])),
    dining: Object.fromEntries(parks.map(p => [p.id, {}])),
    customTasks: Object.fromEntries(parks.map(p => [p.id, []])),
  }
}
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
export function parseState(value: unknown): GuideState {
  if (!object(value) || value.version !== 1 || !object(value.parks)) throw new Error('Formato incompatível. Use um arquivo exportado por este guia (versão 1).')
  const result = initialState()
  for (const [id, raw] of Object.entries(value.parks)) {
    const park = parks.find(p => p.id === id)
    if (!park || !object(raw) || !Array.isArray(raw.order) || !object(raw.statuses) || !object(raw.priorities)) throw new Error('O arquivo contém um parque ou progresso inválido.')
    const known = new Set(park.steps.map(s => s.id))
    if (raw.order.some(s => typeof s !== 'string' || !known.has(s)) || new Set(raw.order).size !== raw.order.length) throw new Error('A ordem das etapas é inválida.')
    const progress = result.parks[id]
    const importedOrder = raw.order as string[]
    progress.order = [...importedOrder, ...progress.order.filter(s => !importedOrder.includes(s))]
    for (const [key, status] of Object.entries(raw.statuses)) {
      if (!known.has(key) || typeof status !== 'string' || !Object.hasOwn(statusLabels, status)) throw new Error('O arquivo contém um status inválido.')
      progress.statuses[key] = status as StepStatus
    }
    for (const [key, priority] of Object.entries(raw.priorities)) {
      if (!known.has(key) || typeof priority !== 'string' || !Object.hasOwn(priorityLabels, priority)) throw new Error('O arquivo contém uma prioridade inválida.')
      progress.priorities[key] = priority as Priority
    }
  }
  // Additive migration: keep the original storage key and schema version. Old
  // snapshots gain empty independent sections without changing attraction data.
  if (value.customTasks !== undefined) {
    if (!object(value.customTasks)) throw new Error('A lista de tarefas pessoais é inválida.')
    for (const [parkId, tasks] of Object.entries(value.customTasks)) {
      if (!parks.some(p => p.id === parkId) || !Array.isArray(tasks) || tasks.length > 100) throw new Error('A lista de tarefas pessoais é inválida (máximo de 100 por parque).')
      const ids = new Set<string>()
      result.customTasks[parkId] = tasks.map(task => {
        if (!object(task) || typeof task.id !== 'string' || !/^personal-[a-zA-Z0-9-]{1,80}$/.test(task.id) || ids.has(task.id) || typeof task.name !== 'string' || !task.name.trim() || task.name.length > 120 || (task.description !== undefined && (typeof task.description !== 'string' || task.description.length > 240))) throw new Error('O arquivo contém uma tarefa pessoal inválida.')
        ids.add(task.id)
        return { id: task.id, name: task.name.trim(), ...(typeof task.description === 'string' ? { description: task.description.trim() } : {}) }
      })
    }
  }
  for (const field of ['preparation', 'dining'] as const) {
    const raw = value[field]
    if (raw === undefined) continue
    if (!object(raw)) throw new Error('O arquivo contém dados de preparação ou alimentação inválidos.')
    for (const [parkId, entries] of Object.entries(raw)) {
      const park = parks.find(p => p.id === parkId)
      if (!park || !object(entries)) throw new Error('O arquivo contém um parque inválido.')
      const known = new Set(field === 'dining' ? park.dining?.map(item => item.id) : [...(park.preparation?.flatMap(group => group.tasks.map(task => task.id)) ?? []), ...result.customTasks[parkId].map(task => task.id)])
      for (const [id, checked] of Object.entries(entries)) {
        if (!known.has(id) || typeof checked !== 'boolean') throw new Error('O arquivo contém uma tarefa ou estabelecimento inválido.')
        result[field][parkId][id] = checked
      }
    }
  }
  return result
}
export function importState(text: string): GuideState {
  if (text.length > 1_000_000) throw new Error('Arquivo muito grande. O limite é 1 MB.')
  let data: unknown
  try { data = JSON.parse(text) } catch { throw new Error('Não foi possível ler o JSON. Verifique o arquivo.') }
  if (!object(data) || data.app !== 'orlando-pocket-guide') throw new Error('Escolha um arquivo exportado pelo guia Orlando 2026.')
  return parseState(data.progress)
}
export function exportState(state: GuideState): string {
  return JSON.stringify({ app: 'orlando-pocket-guide', exportedAt: new Date().toISOString(), itinerary: parks, progress: state }, null, 2)
}
export function moveStep(progress: ParkProgress, id: string, direction: -1 | 1): ParkProgress {
  const order = [...progress.order], index = order.indexOf(id), target = index + direction
  if (index < 0 || target < 0 || target >= order.length) return progress
  ;[order[index], order[target]] = [order[target], order[index]]
  return { ...progress, order }
}
