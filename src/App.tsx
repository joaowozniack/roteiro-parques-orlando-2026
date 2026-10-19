import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ClipboardCheck, Utensils, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight, Clock3, Compass, Download, ExternalLink, Flag, House, Info, ListChecks, MapPin, Mountain, RotateCcw, Route, Settings2, ShieldCheck, SkipForward, Sparkles, Ticket, Upload, Waves, Wifi, WifiOff, X, Zap } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Preparation from './components/Preparation'
import Dining from './components/Dining'
import { activePark, parks, UNIVERSAL_URL } from './data/parks'
import { exportState, importState, initialState, moveStep, parseState, priorityLabels, statusLabels, STORAGE_KEY } from './lib/progress'
import type { GuideState, ItineraryStep, Park, PreparationTask, Priority, StepStatus } from './types'

type InstallEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }
type Filter = 'all' | StepStatus
type ParkSection = 'preparacao' | 'atracoes' | 'alimentacao'
const parkSections: { id: ParkSection; label: string; icon: typeof Route }[] = [
  { id: 'preparacao', label: 'Preparação', icon: ClipboardCheck },
  { id: 'atracoes', label: 'Atrações', icon: Route },
  { id: 'alimentacao', label: 'Alimentação', icon: Utensils },
]
const parkPath = `#/parque/${activePark.id}`
const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

export default function App() {
  const [initial] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return { state: saved ? parseState(JSON.parse(saved)) : initialState(), error: '' } }
    catch { return { state: initialState(), error: 'Não foi possível ler o progresso salvo. Você está usando um roteiro novo nesta aba. Importe um backup para recuperar o progresso; novas alterações tentarão salvar novamente.' } }
  })
  const [state, setState] = useState(initial.state)
  const [history, setHistory] = useState<GuideState[]>([])
  const [storageError, setStorageError] = useState(initial.error)
  const [toast, setToast] = useState('')
  const [hash, setHash] = useState(location.hash)
  const [online, setOnline] = useState(navigator.onLine)
  const [tools, setTools] = useState(false)
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const [existingCacheReady, setExistingCacheReady] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<Filter>('all')
  const [reordering, setReordering] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const { offlineReady: [firstCacheReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW: (_url, registration) => { if (registration?.active) setExistingCacheReady(true) },
    onRegisterError: () => setToast('O modo offline não ficou disponível. Tente recarregar com conexão.'),
  })
  const offlineReady = firstCacheReady || existingCacheReady
  const hashPath = hash.split('?')[0]
  const parkId = hashPath.startsWith('#/parque/') ? hashPath.split('/')[2] : undefined
  const section: ParkSection = parkSections.some(item => item.id === hashPath.split('/')[3]) ? hashPath.split('/')[3] as ParkSection : 'atracoes'
  const park = parks.find(p => p.id === parkId && p.steps.length)
  const currentPark = park ?? activePark
  const requestedRegion = new URLSearchParams(hash.split('?')[1] ?? '').get('regiao') ?? 'all'
  const foodRegion = currentPark.dining?.some(item => item.region.id === requestedRegion) ? requestedRegion : 'all'
  const progress = state.parks[currentPark.id]
  const completed = Object.values(progress.statuses).filter(s => s === 'completed').length
  const laterCount = Object.values(progress.statuses).filter(s => s === 'later').length
  const total = currentPark.steps.length
  const percent = Math.round(completed / total * 100)

  useEffect(() => {
    const route = (event: HashChangeEvent) => {
      setHash(location.hash)
      const previous = new URL(event.oldURL).hash.split('?')[0]
      const next = location.hash.split('?')[0]
      if (previous === next) return
      if (next.startsWith('#/parque/') && previous.split('/')[2] === next.split('/')[2]) document.querySelector('.park-tabs')?.scrollIntoView({ block: 'start' })
      else window.scrollTo(0, 0)
    }
    const connect = () => setOnline(navigator.onLine)
    const prompt = (e: Event) => { e.preventDefault(); setInstall(e as InstallEvent) }
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setState(parseState(JSON.parse(e.newValue))); setHistory([]); setToast('Progresso atualizado por outra aba.') } catch { setStorageError('Outra aba salvou dados incompatíveis. Exporte seu progresso.') }
      }
    }
    window.addEventListener('hashchange', route)
    window.addEventListener('online', connect); window.addEventListener('offline', connect)
    window.addEventListener('beforeinstallprompt', prompt); window.addEventListener('storage', sync)
    return () => { window.removeEventListener('hashchange', route); window.removeEventListener('online', connect); window.removeEventListener('offline', connect); window.removeEventListener('beforeinstallprompt', prompt); window.removeEventListener('storage', sync) }
  }, [])
  useEffect(() => { if (tools) dialog.current?.showModal(); else dialog.current?.close() }, [tools])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5500); return () => clearTimeout(timer) }, [toast])

  function persist(next: GuideState) {
    setState(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStorageError('') }
    catch { setStorageError('O navegador não permitiu salvar. Seu progresso está nesta aba: exporte um backup antes de fechar.') }
  }
  function change(next: GuideState, message: string) { setHistory(h => [...h.slice(-29), state]); persist(next); setToast(message) }
  function changePark(next: typeof progress, message: string) { change({ ...state, parks: { ...state.parks, [currentPark.id]: next } }, message) }
  function status(id: string, value: StepStatus) { changePark({ ...progress, statuses: { ...progress.statuses, [id]: value } }, `Etapa ${statusLabels[value].toLocaleLowerCase('pt-BR')}.`) }
  function sectionPath(section: ParkSection, region = 'all') {
    return `#/parque/${currentPark.id}/${section}${region === 'all' ? '' : `?regiao=${encodeURIComponent(region)}`}`
  }
  function togglePreparation(id: string) {
    const checked = state.preparation[currentPark.id]
    change({ ...state, preparation: { ...state.preparation, [currentPark.id]: { ...checked, [id]: !checked[id] } } }, checked[id] ? 'Tarefa marcada como pendente.' : 'Tarefa concluída.')
  }
  function addPersonalTask(task: PreparationTask) {
    const tasks = state.customTasks[currentPark.id]
    if (tasks.length >= 100) return
    change({ ...state, customTasks: { ...state.customTasks, [currentPark.id]: [...tasks, task] } }, 'Tarefa pessoal adicionada.')
  }
  function deletePersonalTask(id: string) {
    if (!state.customTasks[currentPark.id].some(task => task.id === id)) return
    const checked = { ...state.preparation[currentPark.id] }
    delete checked[id]
    change({ ...state, customTasks: { ...state.customTasks, [currentPark.id]: state.customTasks[currentPark.id].filter(task => task.id !== id) }, preparation: { ...state.preparation, [currentPark.id]: checked } }, 'Tarefa pessoal excluída. Você pode desfazer.')
  }
  function toggleDining(id: string) {
    const tried = state.dining[currentPark.id]
    change({ ...state, dining: { ...state.dining, [currentPark.id]: { ...tried, [id]: !tried[id] } } }, tried[id] ? 'Opção desmarcada.' : 'Experiência gastronômica salva.')
  }
  function undo() {
    const previous = history.at(-1)
    if (!previous) return
    persist(previous); setHistory(h => h.slice(0, -1)); setToast('Última alteração desfeita.')
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportState(state)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'orlando-2026-roteiro.json'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000); setToast('Backup exportado. Guarde o arquivo para importar em outro celular.')
  }
  async function upload(file?: File) {
    if (!file) return
    try { if (file.size > 1_000_000) throw new Error('Arquivo muito grande. O limite é 1 MB.'); const next = importState(await file.text()); change(next, 'Backup importado. Você pode desfazer esta alteração.'); setTools(false) }
    catch (e) { setToast(e instanceof Error ? e.message : 'Não foi possível importar o arquivo.') }
    if (input.current) input.current.value = ''
  }
  function goLater() { setPriorityFilter('all'); setStatusFilter('later'); location.hash = `#/parque/${currentPark.id}`; document.getElementById('roteiro')?.scrollIntoView({ behavior: 'smooth' }) }

  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus(); document.getElementById('main')?.scrollIntoView() }}>Pular para o conteúdo</a>
    <aside className="sidebar">
      <a className="brand" href="#/" aria-label="Orlando 2026, início"><span className="brand-mark"><Compass size={27} /></span><span>orlando<span className="brand-year">2026 / GUIA DE VIAGEM</span></span></a>
      <div className="nav-caption">SUA PRÓXIMA AVENTURA</div>
      <nav aria-label="Navegação principal">
        <a className={!park ? 'active' : ''} href="#/"><House size={19} /> Minha viagem</a>
        <a className={park ? 'active' : ''} href={parkPath} onClick={() => { setStatusFilter('all'); setPriorityFilter('all') }}><Route size={19} /> Meu roteiro <span className="nav-dot" /></a>
        <button onClick={goLater}><RotateCcw size={19} /> Voltar depois {laterCount > 0 && <span className="count">{laterCount}</span>}</button>
      </nav>
      <div className="sidebar-trip"><span className="eyebrow">O PRÓXIMO DESTINO</span><div className="trip-icon"><Mountain size={30} /></div><strong>{currentPark.shortName}</strong><span>{currentPark.date ? dateLabel(currentPark.date) : 'Data a definir'}</span><div className="mini-progress"><i style={{ width: `${percent}%` }} /></div><small>{completed} de {total} etapas concluídas</small></div>
      <div className="sidebar-bottom"><button className="text-button" onClick={() => setTools(true)}><Settings2 size={18} /> Ferramentas da viagem</button><span><ShieldCheck size={14} /> Seu progresso, no seu celular</span></div>
    </aside>
    <div className="app-shell">
      <header className="topbar"><div className="breadcrumb"><Compass size={17} /><span>Minha viagem</span>{park && <><ChevronRight size={14} /><span>{park.shortName}</span></>}</div><div className="top-actions"><span className={`connection ${online ? '' : 'is-offline'}`} title={offlineReady ? 'Arquivos do guia disponíveis offline' : 'O cache offline será preparado no primeiro carregamento completo'}>{online ? <Wifi size={14} /> : <WifiOff size={14} />}<span>{online ? offlineReady ? 'Pronto para usar offline' : 'Online' : 'Você está offline'}</span></span><button className="icon-button" aria-label="Abrir ferramentas da viagem" onClick={() => setTools(true)}><Settings2 size={19} /></button></div></header>
      <main id="main" tabIndex={-1}>
        {storageError && <div className="notice warning" role="alert"><Info size={18} /><span>{storageError}</span><button onClick={download}>Exportar</button></div>}
        {needRefresh && <div className="notice"><Sparkles size={18} /><span>Uma nova versão do guia está pronta.</span><button onClick={() => updateServiceWorker(true)}>Atualizar</button></div>}
        {park ? <>
          <a className="back-link" href="#/"><ArrowLeft size={16} /> Todos os parques</a>
          <section className="park-hero">
            <img className="park-hero-art" src={`${import.meta.env.BASE_URL}island.svg`} alt="" />
            <div className="park-hero-content"><span className="eyebrow"><span className="live-dot" /> SEU DIA DE AVENTURA</span><h1>{park.id === activePark.id ? <>Islands of<br />Adventure</> : park.shortName}<span className="heading-dot">.</span></h1><p>{park.resort}</p>{park.date && <span className="date-pill"><CalendarDays size={15} /> {dateLabel(park.date)}</span>}</div>
          </section>
          <div className="park-tabs" role="tablist" aria-label="Seções do parque" onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const tabs = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>('[role=tab]')]
            const index = tabs.indexOf(document.activeElement as HTMLAnchorElement)
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
            tabs[next]?.focus(); tabs[next]?.click()
          }}>{parkSections.map(item => <a key={item.id} id={`tab-${item.id}`} role="tab" aria-selected={section === item.id} aria-controls="park-section-panel" tabIndex={section === item.id ? 0 : -1} className={section === item.id ? 'selected' : ''} href={sectionPath(item.id)}><item.icon size={18} /><span>{item.label}</span></a>)}</div>
          <div id="park-section-panel" role="tabpanel" aria-labelledby={`tab-${section}`}>
          {section === 'preparacao' ? <Preparation park={park} checked={state.preparation[park.id]} customTasks={state.customTasks[park.id]} onToggle={togglePreparation} onAdd={addPersonalTask} onDelete={deletePersonalTask} onReset={() => change({ ...state, preparation: { ...state.preparation, [park.id]: {} } }, 'Checklist reiniciado. Você pode desfazer.')} /> : section === 'alimentacao' ? <Dining park={park} tried={state.dining[park.id]} region={foodRegion} onRegion={region => { location.hash = sectionPath('alimentacao', region) }} onToggle={toggleDining} /> : <div className="park-layout"><div className="itinerary-main">
            <div className="day-facts"><div><Flag size={18} /><span>Na entrada<strong>{park.arrival ?? 'A definir'}</strong></span></div><div><Clock3 size={18} /><span>Abertura prevista<strong>{park.opening ?? 'A confirmar'}</strong></span></div><div><Mountain size={18} /><span>Fechamento previsto<strong>{park.closing ?? 'A confirmar'}</strong></span></div></div>
            <div className="plan-info">{park.passLabel && <span><Ticket size={15} /> {park.passLabel}</span>}{park.queueAdvice && <span><Zap size={15} /> {park.queueAdvice}</span>}</div>
            <p className="schedule-note"><Info size={14} /> Horários planejados, sujeitos à confirmação no <a href={currentPark.officialUrl ?? UNIVERSAL_URL} target="_blank" rel="noreferrer">aplicativo oficial <ExternalLink size={11} /></a>.</p>
            <section className="mobile-progress"><Progress completed={completed} total={total} /></section>
            <section id="roteiro" className="route-section">
              <div className="section-heading"><div><span className="eyebrow">UM DIA, MUITAS HISTÓRIAS</span><h2>Seu roteiro <span>{total} etapas</span></h2></div><button className={`secondary compact ${reordering ? 'selected' : ''}`} onClick={() => setReordering(!reordering)} aria-pressed={reordering}><ArrowUpDown size={16} /> {reordering ? 'Finalizar' : 'Reordenar'}</button></div>
              <div className="filters" aria-label="Filtrar por prioridade">{(['all', 'essential', 'high', 'optional'] as const).map(value => <button key={value} aria-pressed={priorityFilter === value} className={`filter ${priorityFilter === value ? 'selected' : ''}`} onClick={() => setPriorityFilter(value)}>{value !== 'all' && <span className={`priority-dot ${value}`} />}{value === 'all' ? 'Todas' : priorityLabels[value]}</button>)}</div>
              <div className="status-filter"><label htmlFor="status-filter"><ListChecks size={16} /> Mostrar</label><select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as Filter)}><option value="all">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{value === 'pending' ? 'Pendentes' : value === 'completed' ? 'Concluídas' : value === 'skipped' ? 'Puladas' : label}</option>)}</select><button className="text-button restore" onClick={() => changePark({ ...progress, order: park.steps.map(s => s.id) }, 'Ordem sugerida restaurada.')}><RotateCcw size={13} /> Restaurar ordem sugerida</button></div>
              {reordering && <div className="notice"><ArrowUpDown size={17} /><span>Use as setas para mover cada etapa na ordem completa do roteiro. A numeração original é preservada.</span></div>}
              <div className="step-list">{(() => {
                const ordered = progress.order.map(id => park.steps.find(s => s.id === id)!).filter(Boolean)
                const next = ordered.find(s => progress.statuses[s.id] === 'pending')
                const visible = ordered.filter(s => (priorityFilter === 'all' || progress.priorities[s.id] === priorityFilter) && (statusFilter === 'all' || progress.statuses[s.id] === statusFilter))
                return visible.length ? visible.map(step => <StepCard key={step.id} step={step} status={progress.statuses[step.id]} priority={progress.priorities[step.id]} next={next?.id === step.id} reordering={reordering} first={progress.order[0] === step.id} last={progress.order.at(-1) === step.id} onStatus={value => status(step.id, value)} foodLink={park.dining?.some(item => item.region.id === step.region.id) ? sectionPath('alimentacao', step.region.id) : undefined} onMove={direction => changePark(moveStep(progress, step.id, direction), 'Ordem atualizada.')} />) : <div className="empty-state"><ListChecks size={30} /><h3>Nenhuma etapa por aqui</h3><p>Experimente outra prioridade ou status.</p><button className="secondary" onClick={() => { setStatusFilter('all'); setPriorityFilter('all') }}>Limpar filtros</button></div>
              })()}</div>
            </section>
            <Extras park={park} />
          </div><aside className="day-sidebar"><div className="progress-panel"><span className="eyebrow">CADA ETAPA É UMA CONQUISTA</span><h3>Sua aventura, seu ritmo.</h3><Progress completed={completed} total={total} /><div className="summary-numbers"><div><strong>{total - completed}</strong><span>por explorar</span></div><div><strong>{laterCount}</strong><span>para voltar</span></div></div><p>Curta o caminho. Seu progresso é salvo automaticamente neste dispositivo.</p>{history.length > 0 && <button className="text-button" onClick={undo}><RotateCcw size={14} /> Desfazer última alteração</button>}</div><div className="tip-panel"><Sparkles size={20} /><h3>Uma dica de viagem</h3><p>Single Rider pode separar o grupo. Confira a disponibilidade e avalie se vale a pena em cada atração.</p><a href={currentPark.officialUrl ?? UNIVERSAL_URL} target="_blank" rel="noreferrer">Abrir aplicativo oficial <ExternalLink size={13} /></a></div></aside></div>}
          </div>
        </> : <>
          <section className="welcome"><span className="eyebrow"><span className="live-dot" /> A CONTAGEM REGRESSIVA JÁ COMEÇOU</span><h1>Minha Viagem<br />Orlando <span className="outline-year">2026<span className="heading-dot">.</span></span></h1><p>Grandes aventuras. Um roteiro no bolso.</p><div className="trip-meta"><span><CalendarDays size={16} /> Outubro e novembro de 2026</span><span><MapPin size={16} /> Orlando, Flórida</span></div><div className="welcome-stamp"><Compass size={65} strokeWidth={1} /><span>PRÓXIMA PARADA<br /><strong>MEMÓRIAS INCRÍVEIS</strong></span></div></section>
          <section className="parks-section"><div className="section-heading"><div><span className="eyebrow">ESCOLHA SUA AVENTURA</span><h2>Seus parques<span className="inline-count">04</span></h2></div><span className="muted desktop-only">Uma viagem. Mundos para descobrir.</span></div>
            <a className="featured-park" href={parkPath}><img src={`${import.meta.env.BASE_URL}island.svg`} alt="Ilustração de uma ilha com castelo, montanha-russa e palmeiras" /><div className="featured-overlay" /><div className="featured-content"><span className="ready-label"><span className="live-dot" /> ROTEIRO PRONTO</span><span className="resort-label">UNIVERSAL ORLANDO RESORT</span><h2>Islands of<br />Adventure</h2><p>Um dia entre dinossauros,<br className="desktop-only" /> super-heróis e muita magia.</p><div className="featured-date"><CalendarDays size={16} /><strong>30 OUT</strong><span>Sexta-feira · 2026</span></div><div className="featured-footer"><span className="primary">{completed ? 'Continuar aventura' : 'Explorar roteiro'}<ArrowRight size={17} /></span><span className="featured-step-count">10 atrações + chegada <span>·</span> {percent}% concluído</span></div></div><span className="art-caption">A AVENTURA ESTÁ LOGO ALI ↗</span></a>
            <div className="upcoming-grid">{parks.slice(1).map((p, index) => <article className={`upcoming-park ${p.accent}`} key={p.id}><div className="upcoming-top"><span className="park-symbol">{index === 0 ? <Ticket size={25} /> : index === 1 ? <Sparkles size={25} /> : <Flag size={25} />}</span><span className="soon-label">{p.steps.length ? 'Roteiro pronto' : 'Em breve'}</span></div><span className="resort-label">{p.resort}</span><h3>{p.steps.length ? <a href={`#/parque/${p.id}`}>{p.shortName} <ArrowRight size={14} /></a> : p.shortName}</h3><p>{p.description}</p><div className="not-planned"><CalendarDays size={14} /> {p.steps.length && p.date ? dateLabel(p.date) : 'Roteiro ainda não cadastrado'}</div></article>)}</div>
          </section>
          <section className="home-bottom"><div className="travel-tip"><div className="tip-icon"><Download size={21} /></div><div><h3>Seu guia vai com você. Até offline.</h3><p>Abra uma vez com internet e aguarde a indicação “Pronto para usar offline”. Depois, aproveite o parque.</p></div><button className="secondary" onClick={() => setTools(true)}>Preparar meu celular<ArrowRight size={15} /></button></div><div className="home-note"><ShieldCheck size={16} /><span>Sem conta, sem complicação.<br />Seu progresso fica salvo neste navegador.</span></div></section>
        </>}
        <footer className="footer"><span><Compass size={14} /> Feito para aproveitar o caminho.</span><span>Orlando 2026 <span className="footer-dot">·</span> Seu guia de bolso</span></footer>
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Navegação móvel"><a href="#/" className={!park ? 'active' : ''}><House size={20} /><span>Viagem</span></a><a href={parkPath} className={park ? 'active' : ''} onClick={() => { setStatusFilter('all'); setPriorityFilter('all') }}><Route size={20} /><span>Roteiro</span></a><button onClick={goLater}><RotateCcw size={20} /><span>Voltar depois{laterCount ? ` (${laterCount})` : ''}</span></button><button onClick={() => setTools(true)}><Settings2 size={20} /><span>Ferramentas</span></button></nav>
    <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite"><span>{toast}</span>{history.length > 0 && <button onClick={undo}>Desfazer</button>}<button className="toast-close" aria-label="Fechar aviso" onClick={() => setToast('')}><X size={16} /></button></div>
    <dialog ref={dialog} className="tools-dialog" onClose={() => setTools(false)} onClick={e => { if (e.target === e.currentTarget) setTools(false) }} aria-labelledby="tools-title"><div className="dialog-heading"><div><span className="eyebrow">TUDO PRONTO PARA IR</span><h2 id="tools-title">Ferramentas da viagem</h2></div><button className="icon-button" aria-label="Fechar ferramentas" onClick={() => setTools(false)}><X /></button></div><p>Seu progresso fica neste navegador. Exporte um arquivo para guardar uma cópia ou levar para outro celular.</p><div className="tool-grid"><button className="secondary" onClick={download}><Download size={19} /> Exportar roteiro e progresso</button><button className="secondary" onClick={() => input.current?.click()}><Upload size={19} /> Importar arquivo JSON</button><input ref={input} type="file" accept=".json,application/json" hidden onChange={e => upload(e.target.files?.[0])} /></div><p className="small muted">A importação substitui o progresso atual e permite desfazer. Não há sincronização automática entre celulares. O arquivo inclui o roteiro de referência; a importação restaura o progresso das atrações, checklist, tarefas pessoais e alimentação dos parques cadastrados nesta versão.</p><div className="install-panel"><Download size={22} /><h3>Adicione à tela inicial</h3>{install ? <button className="primary" onClick={async () => { await install.prompt(); const choice = await install.userChoice; if (choice.outcome === 'accepted') setToast('Guia adicionado ao seu celular.'); setInstall(null) }}>Instalar guia <ArrowRight size={16} /></button> : <p>No iPhone, abra no Safari e toque em <strong>Compartilhar → Adicionar à Tela de Início</strong>. No Android, use <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong> no menu do Chrome.</p>}<span className="offline-status">{offlineReady ? <Check size={15} /> : <Info size={15} />}{offlineReady ? 'Arquivos disponíveis para uso offline.' : 'Aguarde o primeiro carregamento completo online para preparar o cache.'}</span></div><a className="official-link" href={currentPark.officialUrl ?? UNIVERSAL_URL} target="_blank" rel="noreferrer">Aplicativo oficial da Universal <ExternalLink size={15} /></a></dialog>
  </>
}

function Progress({ completed, total }: { completed: number; total: number }) {
  const percent = Math.round(completed / total * 100)
  return <div className="progress-block"><div className="progress-label"><span>{completed} de {total} etapas concluídas</span><strong>{percent}%</strong></div><div className="progress-track" role="progressbar" aria-label="Progresso do roteiro" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>{completed === total && <p className="completed-message"><CheckCheck size={17} /> Um dia inteiro de histórias. Aventura concluída!</p>}</div>
}

function StepCard({ step, status, priority, next, reordering, first, last, onStatus, foodLink, onMove }: { step: ItineraryStep; status: StepStatus; priority: Priority; next: boolean; reordering: boolean; first: boolean; last: boolean; onStatus: (status: StepStatus) => void; foodLink?: string; onMove: (direction: -1 | 1) => void }) {
  const [expanded, setExpanded] = useState(step.number === 0)
  return <article id={`step-${step.id}`} className={`step-card priority-${priority} status-${status} ${next ? 'next-step' : ''}`} data-testid={`step-${step.id}`}>
    {next && <div className="next-label"><Route size={12} /> SUA PRÓXIMA ETAPA</div>}
    <div className="step-top"><span className={`step-number ${status === 'completed' ? 'checked' : ''}`}>{status === 'completed' ? <Check size={19} /> : String(step.number).padStart(2, '0')}</span><div className="step-title"><div className="step-meta"><span><MapPin size={12} />{step.region.name}</span><span className={`priority-badge ${priority}`}>{priorityLabels[priority]}{step.conditional ? ` · ${step.conditional.toLocaleLowerCase('pt-BR')}` : ''}</span></div><h3>{step.name}</h3><span className="category">{step.category}</span></div></div>
    <div className="queue-summary"><Route size={15} /><span>{step.queue.label}</span></div>
    {status !== 'pending' && <div className={`status-label ${status}`}>{status === 'completed' ? <CheckCheck size={14} /> : status === 'later' ? <RotateCcw size={14} /> : <SkipForward size={14} />}{statusLabels[status]}{status !== 'completed' && <button onClick={() => onStatus('pending')}>Retomar etapa</button>}</div>}
    {expanded && <div className="step-details" id={`details-${step.id}`}><p>{step.queue.detail}</p><ul>{step.tips.map(tip => <li key={tip}>{tip}</li>)}</ul></div>}
    {foodLink && <a className="nearby-food-link" href={foodLink}><Utensils size={14} /> Ver opções de alimentação em {step.region.name}<ChevronRight size={14} /></a>}
    <div className="step-actions"><button className={`complete-button ${status === 'completed' ? 'is-complete' : ''}`} onClick={() => onStatus(status === 'completed' ? 'pending' : 'completed')} aria-label={`${status === 'completed' ? 'Desmarcar' : 'Concluir'} ${step.name}`} aria-pressed={status === 'completed'}><Check size={16} />{status === 'completed' ? 'Concluída' : 'Concluir'}</button><button className={`later-button ${status === 'later' ? 'is-later' : ''}`} onClick={() => onStatus(status === 'later' ? 'pending' : 'later')} aria-label={`Voltar depois: ${step.name}`} aria-pressed={status === 'later'}><RotateCcw size={15} /><span>Voltar depois</span></button><button className="skip-button" onClick={() => onStatus(status === 'skipped' ? 'pending' : 'skipped')} aria-label={`Pular por enquanto: ${step.name}`} aria-pressed={status === 'skipped'}><SkipForward size={15} /><span>{status === 'skipped' ? 'Retomar' : 'Pular'}</span></button><button className="details-button" aria-expanded={expanded} aria-controls={`details-${step.id}`} aria-label={`${expanded ? 'Recolher' : 'Expandir'} detalhes de ${step.name}`} onClick={() => setExpanded(!expanded)}><span>Detalhes</span><ChevronDown size={16} className={expanded ? 'rotated' : ''} /></button></div>
    {reordering && <div className="reorder-actions"><span>Mover etapa</span><button disabled={first} onClick={() => onMove(-1)} aria-label={`Mover ${step.name} para cima`}><ArrowUp size={18} /> Subir</button><button disabled={last} onClick={() => onMove(1)} aria-label={`Mover ${step.name} para baixo`}><ArrowDown size={18} /> Descer</button></div>}
  </article>
}

function Extras({ park }: { park: Park }) {
  return <><section className="extras"><div className="section-heading"><div><span className="eyebrow">SEM PRESSA, SEM OBRIGAÇÃO</span><h2>Se sobrar tempo <Sparkles size={20} /></h2></div></div><p className="muted">Pequenas descobertas para encaixar se o dia permitir.</p><div className="extra-list">{park.extras.map((extra, index) => <details key={extra.name}><summary><span className="extra-icon">{index === 0 ? <Mountain size={17} /> : index === 2 ? <Waves size={17} /> : <Sparkles size={17} />}</span>{extra.name}<ChevronDown size={16} /></summary><p>{extra.description} Esta parada não faz parte do progresso principal.</p></details>)}</div></section><section className="unavailable"><Info size={19} /><div><h3>Fora do roteiro ativo</h3>{park.unavailable.map(item => <p key={item.name}><strong>{item.name}</strong><br />{item.reason}</p>)}<a href={park.officialUrl ?? UNIVERSAL_URL} target="_blank" rel="noreferrer">Conferir informações oficiais <ExternalLink size={12} /></a></div></section></>
}
