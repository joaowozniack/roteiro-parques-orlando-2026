import { ArrowRight, Ban, Check, Circle, ExternalLink, Info, MapPin, TrainFront } from 'lucide-react'
import { goalStatusLabels } from '../lib/progress'
import type { ExtraGoalStatus, Park } from '../types'

export default function ExtraGoals({ park, statuses, onStatus }: {
  park: Park; statuses: Record<string, ExtraGoalStatus>;
  onStatus(id: string, status: ExtraGoalStatus): void;
}) {
  if (!park.extraGoals?.length) return null
  return <section className="extra-goals" aria-label="Objetivos extras do dia">
    {park.extraGoals.map(goal => {
      const status = statuses[goal.id] ?? 'pending'
      return <article key={goal.id} className={`extra-goal goal-${status}`} data-testid={`goal-${goal.id}`}>
        <div className="goal-heading"><span className="goal-icon"><TrainFront size={25} /></span><div><span className="eyebrow">UMA META A MAIS PARA O DIA</span><h2>{goal.title}</h2></div></div>
        <p className="goal-description">{goal.description}</p>
        <span className="goal-region"><MapPin size={14} /> {goal.region.name}</span>
        <ol className="goal-route">{goal.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <div className="goal-possibilities"><h3>{goal.possibilitiesTitle ?? 'Possibilidades ao chegar'}</h3><ul>{goal.possibilities.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div className="goal-conditions"><Info size={18} /><div><h3>Uma vontade, sem garantia de realização</h3>{goal.conditions.map(condition => <p key={condition}>{condition}</p>)}</div></div>
        <div className="goal-links">{goal.officialUrl && <a href={goal.officialUrl} target="_blank" rel="noreferrer">{goal.officialLabel ?? 'Informações oficiais'} <ExternalLink size={13} /></a>}{goal.destinationParkId && <a href={`#/parque/${goal.destinationParkId}`}>{goal.destinationLabel ?? 'Consultar parque de destino'} <ArrowRight size={14} /></a>}</div>
        <div className="goal-status-heading"><span>Estado do objetivo: <strong>{goalStatusLabels[status]}</strong></span><small>Separado do progresso das atrações</small></div>
        <div className="goal-status-buttons" role="group" aria-label={`Estado de ${goal.title}`}>{(['pending', 'completed', 'not_done'] as const).map(value => <button key={value} aria-pressed={status === value} className={status === value ? 'selected' : ''} onClick={() => onStatus(goal.id, value)}>{value === 'completed' ? <Check size={16} /> : value === 'not_done' ? <Ban size={16} /> : <Circle size={15} />}{goalStatusLabels[value]}</button>)}</div>
      </article>
    })}
  </section>
}
