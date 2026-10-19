import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ClipboardCheck, Info, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import type { Park, PreparationTask } from '../types'

interface Props {
  park: Park; checked: Record<string, boolean>; customTasks: PreparationTask[];
  onToggle(id: string): void; onAdd(task: PreparationTask): void; onDelete(id: string): void; onReset(): void;
}

export default function Preparation({ park, checked, customTasks, onToggle, onAdd, onDelete, onReset }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const resetDialog = useRef<HTMLDialogElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const groups = park.preparation ?? []
  const allTasks = [...groups.flatMap(group => group.tasks), ...customTasks]
  const completed = allTasks.filter(task => checked[task.id]).length
  const percent = allTasks.length ? Math.round(completed / allTasks.length * 100) : 0
  useEffect(() => { if (confirmReset) resetDialog.current?.showModal(); else resetDialog.current?.close() }, [confirmReset])

  function taskRow(task: PreparationTask, personal = false) {
    return <div className={`preparation-task ${checked[task.id] ? 'task-done' : 'task-pending'}`} key={task.id}>
      <label><input type="checkbox" aria-label={task.name} checked={!!checked[task.id]} onChange={() => onToggle(task.id)} /><span><strong>{task.name}</strong>{task.description && <small>{task.description}</small>}</span></label>
      {personal && <button className="icon-button delete-task" onClick={() => onDelete(task.id)} aria-label={`Excluir tarefa pessoal: ${task.name}`}><Trash2 size={17} /></button>}
    </div>
  }

  return <section className="preparation-section" aria-labelledby="preparation-title">
    <div className="section-heading"><div><span className="eyebrow">COMECE O DIA COM TRANQUILIDADE</span><h2 id="preparation-title">Antes de sair <ClipboardCheck size={22} /></h2></div></div>
    <p className="section-intro">Tudo o que vale conferir antes de sair da hospedagem. Este checklist é independente das atrações.</p>
    <div className="preparation-summary"><div className="progress-label"><span>{completed} de {allTasks.length} tarefas concluídas</span><strong>{percent}%</strong></div><div className="progress-track" role="progressbar" aria-label="Progresso da preparação" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div><p>{completed === allTasks.length && allTasks.length > 0 ? <><Check size={15} /> Tudo conferido. Boa aventura!</> : <>{allTasks.length - completed} tarefas pendentes · salvo automaticamente</>}</p></div>
    <div className="notice preparation-arrival"><Info size={18} /><span>Chegada planejada: <strong>{park.arrival ?? 'horário a definir'} na entrada do parque</strong>. Reserve tempo para estacionar, caminhar e passar pela segurança.</span></div>
    <div className="preparation-groups">{groups.map(group => {
      const count = group.tasks.filter(task => checked[task.id]).length
      return <details className="preparation-group" key={group.id} open><summary><span className={`group-dot ${count === group.tasks.length ? 'group-done' : ''}`}>{count === group.tasks.length ? <Check size={13} /> : <span />}</span><h3>{group.name}</h3><span className="group-count">{count}/{group.tasks.length}</span><ChevronDown size={17} /></summary><div>{group.tasks.map(task => taskRow(task))}</div></details>
    })}</div>
    <section className="personal-tasks" aria-labelledby="personal-tasks-title"><div className="section-heading"><div><span className="eyebrow">DO SEU JEITO</span><h3 id="personal-tasks-title">Tarefas pessoais</h3></div><span className="muted small">{customTasks.length}/100</span></div>{customTasks.length > 0 && <div className="personal-task-list">{customTasks.map(task => taskRow(task, true))}</div>}<form onSubmit={event => { event.preventDefault(); if (!name.trim() || customTasks.length >= 100) return; onAdd({ id: `personal-${crypto.randomUUID()}`, name: name.trim(), ...(description.trim() ? { description: description.trim() } : {}) }); setName(''); setDescription(''); nameInput.current?.focus() }}>
      <label htmlFor="personal-task-name">Nova tarefa</label><input ref={nameInput} id="personal-task-name" maxLength={120} required value={name} onChange={event => setName(event.target.value)} placeholder="Ex.: levar óculos de sol" disabled={customTasks.length >= 100} />
      <label htmlFor="personal-task-description">Descrição <span className="muted">(opcional)</span></label><input id="personal-task-description" maxLength={240} value={description} onChange={event => setDescription(event.target.value)} placeholder="Um lembrete rápido para você" disabled={customTasks.length >= 100} />
      <button className="secondary" type="submit" disabled={!name.trim() || customTasks.length >= 100}><Plus size={17} /> Adicionar tarefa</button>
    </form></section>
    <div className="checklist-reset"><p>As marcações continuam salvas ao reabrir o guia. O checklist não reinicia automaticamente.</p><button className="secondary" onClick={() => setConfirmReset(true)}><RotateCcw size={15} /> Reiniciar checklist</button></div>
    <dialog ref={resetDialog} className="tools-dialog reset-dialog" onClose={() => setConfirmReset(false)} onClick={event => { if (event.target === event.currentTarget) setConfirmReset(false) }} aria-labelledby="reset-title"><div className="dialog-heading"><h2 id="reset-title">Reiniciar checklist?</h2><button className="icon-button" onClick={() => setConfirmReset(false)} aria-label="Fechar confirmação"><X size={18} /></button></div><p>Todas as tarefas deste parque voltarão a ficar pendentes. Suas tarefas pessoais serão mantidas. O progresso das atrações e da alimentação permanece igual.</p><div className="dialog-actions"><button autoFocus className="secondary" onClick={() => setConfirmReset(false)}>Cancelar</button><button className="primary" onClick={() => { onReset(); setConfirmReset(false) }}>Sim, reiniciar checklist</button></div></dialog>
  </section>
}
