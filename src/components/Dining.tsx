import { Coffee, Cookie, Info, MapPin, Search, Utensils, X } from 'lucide-react'
import { useState } from 'react'
import type { FoodType, Park } from '../types'

export const foodTypeLabels: Record<FoodType, string> = { restaurant: 'Restaurante', snack: 'Lanche', drink: 'Bebida', sweet: 'Doce' }
const filterLabels: Record<FoodType, string> = { restaurant: 'Restaurantes', snack: 'Lanches', drink: 'Bebidas', sweet: 'Doces' }
const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')

export default function Dining({ park, tried, region, onRegion, onToggle }: { park: Park; tried: Record<string, boolean>; region: string; onRegion(id: string): void; onToggle(id: string): void }) {
  const [type, setType] = useState<FoodType | 'all'>('all')
  const [search, setSearch] = useState('')
  const options = park.dining ?? []
  const regions = [...new Map(options.map(item => [item.region.id, item.region])).values()]
  const visible = options.filter(item => (type === 'all' || item.type === type) && (region === 'all' || item.region.id === region) && normalize(item.name).includes(normalize(search.trim())))
  const count = options.filter(item => tried[item.id]).length

  return <section className="dining-section" aria-labelledby="dining-title">
    <div className="section-heading"><div><span className="eyebrow">UMA PAUSA TAMBÉM FAZ PARTE</span><h2 id="dining-title">Lanches e refeições <Utensils size={21} /></h2></div></div>
    <p className="section-intro">Escolha conforme a fome e a região em que estiver. São sugestões para consultar, sem ordem obrigatória ou horário fixo.</p>
    <div className="food-price-note"><Info size={17} /><p>Valores aproximados em dólares americanos, sujeitos a alterações e impostos. São estimativas de referência fornecidas no planejamento, não preços confirmados para 30/10/2026.</p></div>
    <div className="food-search"><Search size={18} /><label className="sr-only" htmlFor="food-search">Pesquisar alimentação por nome</label><input type="search" id="food-search" placeholder="Buscar restaurante, bebida ou doce…" maxLength={120} value={search} onChange={event => setSearch(event.target.value)} />{search && <button aria-label="Limpar pesquisa de alimentação" onClick={() => setSearch('')}><X size={16} /></button>}</div>
    <div className="food-type-filters" aria-label="Filtrar alimentação por tipo">{(['all', 'restaurant', 'snack', 'drink', 'sweet'] as const).map(value => <button key={value} className={type === value ? 'selected' : ''} aria-pressed={type === value} onClick={() => setType(value)}>{value === 'all' ? 'Todos' : filterLabels[value]}</button>)}</div>
    <div className="food-region-filter"><label htmlFor="food-region"><MapPin size={15} /> Região do parque</label><select id="food-region" value={region} onChange={event => onRegion(event.target.value)}><option value="all">Todas as regiões</option>{regions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span>{visible.length} {visible.length === 1 ? 'opção' : 'opções'} · {count} {count === 1 ? 'experimentada' : 'experimentadas'}</span></div>
    <div className="food-grid">{visible.map(item => <article className={`food-card ${tried[item.id] ? 'food-tried' : ''}`} key={item.id} data-testid={`food-${item.id}`}>
      <div className="food-card-meta"><span className="food-icon">{item.type === 'drink' ? <Coffee size={22} /> : item.type === 'sweet' ? <Cookie size={22} /> : <Utensils size={22} />}</span><div><span>{foodTypeLabels[item.type]}</span><span><MapPin size={12} /> {item.region.name}</span></div></div>
      <h3>{item.name}</h3><p className="food-description">{item.description}</p><div className="food-recommendation"><span>PARA EXPERIMENTAR</span><p>{item.recommendation}</p></div><div className="food-price"><span>Preço de referência</span><strong>{item.price}</strong></div>{item.note && <p className="food-note">{item.note}</p>}<label className="food-tried-control"><input type="checkbox" aria-label={`Já experimentei: ${item.name}`} checked={!!tried[item.id]} onChange={() => onToggle(item.id)} /><span>Já experimentei</span><small>{tried[item.id] ? 'Salvo no seu guia' : 'Marque quando provar'}</small></label>
    </article>)}</div>
    {visible.length === 0 && <div className="empty-state"><Search size={28} /><h3>Nenhuma opção encontrada</h3><p>Experimente outro nome, tipo ou região.</p><button className="secondary" onClick={() => { setType('all'); setSearch(''); onRegion('all') }}>Limpar filtros de alimentação</button></div>}
    <p className="food-footer-note">Experimentar uma opção não altera o progresso das atrações. Confirme cardápios, disponibilidade e valores no local ou no aplicativo oficial.</p>
  </section>
}
