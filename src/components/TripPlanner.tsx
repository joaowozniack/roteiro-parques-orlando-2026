import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CalendarDays, Check, ChevronDown, Clock3, EyeOff, Flag, House, Info, MapPin, Pencil, Plane, Plus, RotateCcw, ShoppingBag, SkipForward, Sparkles, Ticket, Trash2, Utensils, X } from 'lucide-react'
import { tripDays } from '../data/travel'
import { parks } from '../data/parks'
import { activityStatusLabels, categoryLabels, deleteActivity, editActivity, emptyTripDay, moveActivity, tripActivities, tripDaySummary } from '../lib/travel'
import type { ActivityCategory, ActivityFields, ActivityStatus, TripActivity, TripDay, TripDayProgress, TripProgress } from '../types'

const icons = { travel: Plane, stay: House, shopping: ShoppingBag, outing: Sparkles, park: Ticket, food: Utensils, event: Flag }
const date = (value: string) => new Date(`${value}T12:00:00`)
const dateLabel = (value: string) => date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', weekday: 'long' })
const shortDate = (value: string) => date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

interface Props {
  day: TripDay; today: string; trip: TripProgress;
  onSelect(day: string): void; onChange(day: string, progress: TripDayProgress, message: string): void;
}

export default function TripPlanner({ day, today, trip, onSelect, onChange }: Props) {
  const progress = trip.days[day.id] ?? emptyTripDay()
  const activities = tripActivities(day, progress)
  const visible = activities.filter(activity => !progress.hidden.includes(activity.id))
  const summary = tripDaySummary(day, progress)
  const index = tripDays.findIndex(item => item.id === day.id)
  const todayInTrip = tripDays.some(day => day.date === today)
  const [editing, setEditing] = useState<TripActivity | 'new' | null>(null)
  const [reordering, setReordering] = useState(false)
  const dateRail = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setEditing(null)
    dateRail.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [day.id])
  function update(next: TripDayProgress, message: string) { onChange(day.id, next, message) }
  function status(id: string, value: ActivityStatus) {
    const statuses = { ...progress.statuses }
    if (value === 'pending') delete statuses[id]
    else statuses[id] = value
    update({ ...progress, statuses }, `Atividade ${activityStatusLabels[value].toLocaleLowerCase('pt-BR')}. Você pode desfazer.`)
  }
  function save(fields: ActivityFields) {
    if (editing === 'new') {
      if (progress.customActivities.length >= 100) return
      const activity = { id: `trip-personal-${crypto.randomUUID()}`, ...fields }
      update({ ...progress, customActivities: [...progress.customActivities, activity], ...(progress.order ? { order: [...progress.order, activity.id] } : {}) }, 'Atividade adicionada ao dia. Você pode desfazer.')
    } else if (editing) update(editActivity(day, progress, editing.id, fields), 'Atividade atualizada. Você pode desfazer.')
    setEditing(null)
  }
  const CategoryIcon = icons[day.category]
  return <section className="trip-planner" aria-labelledby="trip-title">
    <a className="back-link" href="#/"><ArrowLeft size={16} /> Minha viagem</a>
    <header className="trip-heading"><div><span className="eyebrow">ORLANDO & MIAMI · 2026</span><h1 id="trip-title">Roteiro da Viagem<span className="heading-dot">.</span></h1><p>Um dia de cada vez. Todas as memórias pelo caminho.</p></div><span className="trip-duration"><CalendarDays size={18} /> 27 OUT — 09 NOV <small>14 dias · retorno incluído</small></span></header>
    <div className="trip-toolbar"><span>Escolha seu dia <span className="muted">/ {index + 1} de {tripDays.length}</span></span>{todayInTrip && <button className="secondary compact" onClick={() => onSelect(today)}><CalendarDays size={15} /> Ir para hoje</button>}</div>
    <div className="trip-date-rail" ref={dateRail} role="group" aria-label="Datas da viagem">{tripDays.map(item => {
      const done = tripDaySummary(item, trip.days[item.id])
      return <button key={item.id} className={`trip-date ${item.id === day.id ? 'selected' : ''} ${item.date === today ? 'is-today' : ''}`} aria-label={`${dateLabel(item.date)} — ${item.title}`} aria-pressed={item.id === day.id} aria-current={item.date === today ? 'date' : undefined} onClick={() => onSelect(item.id)}><span>{date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><strong>{item.date.slice(8)}</strong><small>{date(item.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small><i className={done.total > 0 && done.percent === 100 ? 'date-done' : item.category === 'park' ? 'date-park' : ''}>{done.total > 0 && done.percent === 100 ? <Check size={10} /> : item.date === today ? 'Hoje' : item.category === 'park' ? 'Parque' : '·'}</i></button>
    })}</div>
    <div className="trip-content"><div className="trip-day-content">
      <section className={`trip-day-header day-${day.category}`} aria-labelledby="trip-day-title"><div className="trip-day-kicker"><span><CategoryIcon size={16} />{categoryLabels[day.category]}</span><span>{day.date === today ? 'HOJE' : `DIA ${String(index + 1).padStart(2, '0')}`}</span></div><p className="trip-full-date">{dateLabel(day.date)} · 2026</p><h2 id="trip-day-title">{day.title}</h2><p className="trip-region"><MapPin size={15} />{day.region}</p><div className="trip-day-progress"><div><span>{summary.completed} de {summary.total} atividades concluídas</span><strong>{summary.percent}%</strong></div><div className="progress-track" role="progressbar" aria-label="Progresso do dia" aria-valuenow={summary.percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${summary.percent}%` }} /></div></div></section>
      <div className="trip-day-navigation"><button className="secondary compact" disabled={index === 0} onClick={() => onSelect(tripDays[index - 1].id)}><ArrowLeft size={15} /> Dia anterior</button><button className="secondary compact" disabled={index === tripDays.length - 1} onClick={() => onSelect(tripDays[index + 1].id)}>Próximo dia <ArrowRight size={15} /></button></div>
      {day.notes && <p className="trip-day-note"><Info size={17} />{day.notes}</p>}
      <div className="trip-activities-heading"><h3>O plano do dia <span>{visible.length} atividades</span></h3><button className="text-button" aria-pressed={reordering} onClick={() => setReordering(!reordering)}>{reordering ? 'Finalizar ordem' : 'Reordenar atividades'}</button></div>
      <div className="trip-timeline">{visible.map((activity, position) => <ActivityCard key={`${day.id}-${activity.id}`} activity={activity} status={progress.statuses[activity.id] ?? 'pending'} custom={progress.customActivities.some(item => item.id === activity.id)} edited={!!progress.edits[activity.id]} index={position} onStatus={value => status(activity.id, value)} onEdit={() => setEditing(activity)} onRemove={() => {
        if (progress.customActivities.some(item => item.id === activity.id)) update(deleteActivity(progress, activity.id), 'Atividade personalizada excluída. Você pode desfazer.')
        else update({ ...progress, hidden: [...progress.hidden, activity.id] }, 'Atividade original ocultada. Você pode restaurar ou desfazer.')
      }} onRestore={() => { const edits = { ...progress.edits }; delete edits[activity.id]; update({ ...progress, edits }, 'Texto original restaurado. As marcações foram mantidas.') }} reordering={reordering} first={position === 0} last={position === visible.length - 1} onMove={direction => update(moveActivity(day, progress, activity.id, direction), 'Ordem das atividades atualizada.')} />)}</div>
      {visible.length === 0 && <p className="trip-day-note">Nenhuma atividade visível. Adicione uma atividade ou restaure as que foram ocultadas.</p>}
      <button className="secondary trip-add" onClick={() => setEditing('new')} disabled={progress.customActivities.length >= 100}><Plus size={18} /> Adicionar atividade</button>
      {progress.hidden.length > 0 && <details className="trip-hidden"><summary><EyeOff size={16} /> {progress.hidden.length} atividades ocultas <ChevronDown size={16} /></summary>{day.activities.filter(activity => progress.hidden.includes(activity.id)).map(activity => <div key={activity.id}><span>{progress.edits[activity.id]?.name ?? activity.name}</span><button className="text-button" aria-label={`Restaurar ${activity.name}`} onClick={() => update({ ...progress, hidden: progress.hidden.filter(id => id !== activity.id) }, 'Atividade restaurada.')}>Restaurar</button></div>)}</details>}
      <p className="trip-independence"><Info size={15} /> O progresso diário é independente dos parques e do checklist. Atividades opcionais e ocultas ficam fora do percentual. Horários são locais e precisam ser confirmados.</p>
    </div><aside className="trip-overview"><details open><summary><CalendarDays size={17} /> Todos os dias <ChevronDown size={17} /></summary><div className="trip-overview-list">{tripDays.map(item => {
      const info = tripDaySummary(item, trip.days[item.id]), Icon = icons[item.category]
      return <button key={item.id} aria-pressed={item.id === day.id} className={item.id === day.id ? 'selected' : ''} onClick={() => onSelect(item.id)}><span className="overview-day">{shortDate(item.date)}</span><span><strong>{item.title}</strong><small>{item.region} · {info.completed}/{info.total}</small></span><Icon size={15} /></button>
    })}</div></details></aside></div>
    {editing && <ActivityEditor key={`${day.id}-${editing === 'new' ? 'new' : editing.id}`} activity={editing === 'new' ? undefined : editing} onSave={save} onClose={() => setEditing(null)} />}
  </section>
}

function ActivityCard({ activity, status, custom, edited, index, onStatus, onEdit, onRemove, onRestore, reordering, first, last, onMove }: {
  activity: TripActivity; status: ActivityStatus; custom: boolean; edited: boolean; index: number;
  onStatus(status: ActivityStatus): void; onEdit(): void; onRemove(): void; onRestore(): void;
  reordering: boolean; first: boolean; last: boolean; onMove(direction: -1 | 1): void;
}) {
  const [expanded, setExpanded] = useState(false)
  const Icon = icons[activity.category]
  const linked = parks.find(park => park.id === activity.linkedParkId)
  return <article className={`trip-activity activity-${status}`} data-testid={`activity-${activity.id}`}>
    <div className="activity-marker">{status === 'completed' ? <Check size={16} /> : String(index + 1).padStart(2, '0')}</div>
    <div className="activity-meta"><span><Icon size={14} /> {categoryLabels[activity.category]}</span>{activity.optional && <span className="activity-optional">Opcional</span>}{activity.time && <span className="activity-time"><Clock3 size={13} /> {activity.time.replace(':', 'h')}</span>}</div>
    <h3>{activity.name}</h3>
    {activity.location && <p className="activity-location"><MapPin size={13} /> {activity.location}</p>}
    {linked && <a className="activity-park-link" href={`#/parque/${linked.id}`}>Abrir roteiro do {linked.shortName}<ArrowRight size={17} /></a>}
    {status !== 'pending' && <span className="activity-status">{activityStatusLabels[status]}</span>}
    {expanded && <div className="activity-details" id={`activity-details-${activity.id}`}>
      {activity.description && <p>{activity.description}</p>}
      <div className="activity-notes"><strong>Observações</strong><p>{activity.notes || 'Nenhuma observação adicionada.'}</p></div>
      <div className="activity-manage"><button className="text-button" onClick={onEdit}><Pencil size={14} /> Editar atividade</button><button className="text-button" onClick={onRemove}>{custom ? <Trash2 size={14} /> : <EyeOff size={14} />}{custom ? 'Excluir atividade' : 'Ocultar atividade'}</button>{edited && <button className="text-button" onClick={onRestore}><RotateCcw size={14} /> Restaurar texto original</button>}</div>
    </div>}
    <div className="activity-actions"><button className={`secondary compact ${status === 'completed' ? 'selected' : ''}`} aria-label={`${status === 'completed' ? 'Desmarcar' : 'Concluir'} atividade: ${activity.name}`} aria-pressed={status === 'completed'} onClick={() => onStatus(status === 'completed' ? 'pending' : 'completed')}><Check size={16} /> {status === 'completed' ? 'Concluída' : 'Concluir'}</button><button className="text-button" aria-label={`Pular atividade: ${activity.name}`} aria-pressed={status === 'skipped'} onClick={() => onStatus(status === 'skipped' ? 'pending' : 'skipped')}><SkipForward size={15} /> {status === 'skipped' ? 'Retomar' : 'Pular'}</button><button className="text-button activity-expand" aria-label={`${expanded ? 'Recolher' : 'Expandir'} atividade: ${activity.name}`} aria-expanded={expanded} aria-controls={`activity-details-${activity.id}`} onClick={() => setExpanded(!expanded)}>Detalhes <ChevronDown size={16} className={expanded ? 'rotated' : ''} /></button></div>
    {reordering && <div className="reorder-actions"><span>Mover atividade</span><button aria-label={`Mover ${activity.name} para cima`} disabled={first} onClick={() => onMove(-1)}><ArrowUp size={15} /> Subir</button><button aria-label={`Mover ${activity.name} para baixo`} disabled={last} onClick={() => onMove(1)}><ArrowDown size={15} /> Descer</button></div>}
  </article>
}

function ActivityEditor({ activity, onSave, onClose }: { activity?: TripActivity; onSave(fields: ActivityFields): void; onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [fields, setFields] = useState<ActivityFields>({ name: activity?.name ?? '', description: activity?.description ?? '', time: activity?.time ?? '', location: activity?.location ?? '', category: activity?.category ?? 'outing', notes: activity?.notes ?? '' })
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog className="tools-dialog trip-editor" ref={dialog} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }} aria-labelledby="activity-editor-title"><div className="dialog-heading"><h2 id="activity-editor-title">{activity ? 'Editar atividade' : 'Nova atividade'}</h2><button className="icon-button" aria-label="Fechar edição de atividade" onClick={onClose}><X size={18} /></button></div><form onSubmit={event => { event.preventDefault(); if (fields.name.trim()) onSave({ ...fields, name: fields.name.trim() }) }}>
    <label htmlFor="activity-name">Nome</label><input autoFocus id="activity-name" required maxLength={140} value={fields.name} onChange={event => setFields({ ...fields, name: event.target.value })} />
    <label htmlFor="activity-description">Descrição (opcional)</label><textarea id="activity-description" maxLength={1000} rows={3} value={fields.description} onChange={event => setFields({ ...fields, description: event.target.value })} />
    <div className="activity-form-row"><div><label htmlFor="activity-time">Horário local (opcional)</label><input id="activity-time" type="time" value={fields.time} onChange={event => setFields({ ...fields, time: event.target.value })} /></div><div><label htmlFor="activity-category">Categoria</label><select id="activity-category" value={fields.category} onChange={event => setFields({ ...fields, category: event.target.value as ActivityCategory })}>{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></div>
    <label htmlFor="activity-location">Localização (opcional)</label><input id="activity-location" maxLength={240} value={fields.location} onChange={event => setFields({ ...fields, location: event.target.value })} />
    <label htmlFor="activity-notes">Observações pessoais (opcional)</label><textarea id="activity-notes" rows={4} maxLength={1500} placeholder="Participantes, restaurante escolhido, ponto de encontro…" value={fields.notes} onChange={event => setFields({ ...fields, notes: event.target.value })} />
    <div className="activity-form-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button type="submit" className="primary" disabled={!fields.name.trim()}>Salvar atividade <Check size={16} /></button></div>
  </form></dialog>
}
