import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown, Clock3, Flag, House, Info, MapPin, Plane, ShoppingBag, Sparkles, Ticket, Utensils } from 'lucide-react'
import { tripDays } from '../data/travel'
import { parks } from '../data/parks'
import { categoryLabels, deviceDay } from '../lib/travel'
import type { TripActivity, TripDay } from '../types'

const icons = { travel: Plane, stay: House, shopping: ShoppingBag, outing: Sparkles, park: Ticket, food: Utensils, event: Flag }
const date = (value: string) => new Date(`${value}T12:00:00`)
const dateLabel = (value: string) => date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', weekday: 'long' })
const shortDate = (value: string) => date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

export default function TripPlanner({ day, today, onSelect }: { day: TripDay; today: string; onSelect(day: string): void }) {
  const index = tripDays.findIndex(item => item.id === day.id)
  const todayInTrip = tripDays.some(day => day.date === today)
  const dateRail = useRef<HTMLDivElement>(null)
  useEffect(() => {
    dateRail.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [day.id])
  const CategoryIcon = icons[day.category]
  return <section className="trip-planner" aria-labelledby="trip-title">
    <a className="back-link" href="#/"><ArrowLeft size={16} /> Minha viagem</a>
    <header className="trip-heading"><div><span className="eyebrow">ORLANDO & MIAMI · 2026</span><h1 id="trip-title">Roteiro da Viagem<span className="heading-dot">.</span></h1><p>Um dia de cada vez. Todas as memórias pelo caminho.</p></div><span className="trip-duration"><CalendarDays size={18} /> 27 OUT — 09 NOV <small>14 dias · retorno incluído</small></span></header>
    <div className="trip-toolbar"><span>Escolha seu dia <span className="muted">/ {index + 1} de {tripDays.length}</span></span>{todayInTrip && <button className="secondary compact" onClick={() => onSelect(deviceDay())}><CalendarDays size={15} /> Ir para hoje</button>}</div>
    <div className="trip-date-rail" ref={dateRail} role="group" aria-label="Datas da viagem">{tripDays.map(item => <button key={item.id} className={`trip-date ${item.id === day.id ? 'selected' : ''} ${item.date === today ? 'is-today' : ''}`} aria-label={`${dateLabel(item.date)} — ${item.title}`} aria-pressed={item.id === day.id} aria-current={item.date === today ? 'date' : undefined} onClick={() => onSelect(item.id)}><span>{date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><strong>{item.date.slice(8)}</strong><small>{date(item.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small><i className={item.category === 'park' ? 'date-park' : ''}>{item.date === today ? 'Hoje' : item.category === 'park' ? 'Parque' : '·'}</i></button>)}</div>
    <div className="trip-content"><div className="trip-day-content">
      <section className={`trip-day-header day-${day.category}`} aria-labelledby="trip-day-title"><div className="trip-day-kicker"><span><CategoryIcon size={16} />{categoryLabels[day.category]}</span><span>{day.date === today ? 'HOJE' : `DIA ${String(index + 1).padStart(2, '0')}`}</span></div><p className="trip-full-date">{dateLabel(day.date)} · 2026</p><h2 id="trip-day-title">{day.title}</h2><p className="trip-region"><MapPin size={15} />{day.region}</p></section>
      <div className="trip-day-navigation"><button className="secondary compact" disabled={index === 0} onClick={() => onSelect(tripDays[index - 1].id)}><ArrowLeft size={15} /> Dia anterior</button><button className="secondary compact" disabled={index === tripDays.length - 1} onClick={() => onSelect(tripDays[index + 1].id)}>Próximo dia <ArrowRight size={15} /></button></div>
      {day.notes && <p className="trip-day-note"><Info size={17} />{day.notes}</p>}
      <div className="trip-activities-heading"><h3>O plano do dia <span>{day.activities.length} atividades programadas</span></h3></div>
      <div className="trip-timeline">{day.activities.map((activity, position) => <ActivityCard key={`${day.id}-${activity.id}`} activity={activity} index={position} />)}</div>
      <p className="trip-independence"><Info size={15} /> Programação para consulta. Horários são locais e precisam ser confirmados nas passagens, reservas e aplicativos oficiais.</p>
    </div><aside className="trip-overview"><details open><summary><CalendarDays size={17} /> Todos os dias <ChevronDown size={17} /></summary><div className="trip-overview-list">{tripDays.map(item => {
      const Icon = icons[item.category]
      return <button key={item.id} aria-pressed={item.id === day.id} className={item.id === day.id ? 'selected' : ''} onClick={() => onSelect(item.id)}><span className="overview-day">{shortDate(item.date)}</span><span><strong>{item.title}</strong><small>{item.region}</small></span><Icon size={15} /></button>
    })}</div></details></aside></div>
  </section>
}

function ActivityCard({ activity, index }: { activity: TripActivity; index: number }) {
  const Icon = icons[activity.category]
  const linked = parks.find(park => park.id === activity.linkedParkId)
  return <article className="trip-activity" data-testid={`activity-${activity.id}`}>
    <div className="activity-marker">{String(index + 1).padStart(2, '0')}</div>
    <div className="activity-meta"><span><Icon size={14} /> {categoryLabels[activity.category]}</span>{activity.optional && <span className="activity-optional">Opcional</span>}{activity.time && <span className="activity-time"><Clock3 size={13} /> {activity.time.replace(':', 'h')}</span>}</div>
    <h3>{activity.name}</h3>
    {activity.location && <p className="activity-location"><MapPin size={13} /> {activity.location}</p>}
    {(activity.description || activity.notes) && <div className="activity-details">{activity.description && <p>{activity.description}</p>}{activity.notes && <div className="activity-notes"><strong>Observações</strong><p>{activity.notes}</p></div>}</div>}
    {linked && <a className="activity-park-link" href={`#/parque/${linked.id}`}>Ver atrações do {linked.shortName}<ArrowRight size={17} /></a>}
  </article>
}
