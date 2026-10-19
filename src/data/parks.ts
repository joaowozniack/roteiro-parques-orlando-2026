import type { Park, Region, ItineraryStep } from '../types'
import { islandsDining, islandsPreparation } from './islands-extras'

const region = (id: string, name: string): Region => ({ id, name })
const regions = {
  entrance: region('entrance', 'Entrada do parque'), jurassic: region('jurassic', 'Jurassic Park'),
  hogsmeade: region('hogsmeade', 'Hogsmeade'), skull: region('skull', 'Skull Island'),
  toon: region('toon', 'Toon Lagoon'), marvel: region('marvel', 'Marvel Super Hero Island'),
}
const steps: ItineraryStep[] = [
  { id: 'arrival', number: 0, kind: 'arrival', name: 'A aventura começa aqui', region: regions.entrance, priority: 'high', category: 'Chegada · 08h30', queue: { label: 'Prepare-se para a abertura', detail: 'Chegue à entrada do Islands of Adventure às 08h30 e aguarde a abertura geral.' }, tips: ['Passe pela segurança e prepare o aplicativo oficial da Universal.', '08h30 é o horário na entrada do parque. Reserve tempo para estacionar e caminhar até lá.'] },
  { id: 'velocicoaster', number: 1, kind: 'attraction', name: 'Jurassic World VelociCoaster', region: regions.jurassic, priority: 'essential', category: 'Montanha-russa', queue: { label: 'Fila normal ou Single Rider', detail: 'Use Single Rider somente se estiver disponível e for vantajoso. Há visitantes com entrada antecipada: confira a situação real no local.' }, tips: ['Sua primeira atração após a abertura.', 'Siga pelo lado direito: Seuss Landing → Lost Continent → Hogsmeade. Vá direto, sem paradas.'] },
  { id: 'forbidden-journey', number: 2, kind: 'attraction', name: 'Harry Potter and the Forbidden Journey', region: regions.hogsmeade, priority: 'essential', category: 'Aventura imersiva', queue: { label: 'Prefira a fila normal', detail: 'Na primeira visita, a fila normal faz parte da experiência: aproveite os ambientes do Castelo de Hogwarts.' }, tips: ['Conheça o Castelo de Hogwarts com calma.', 'Considere Single Rider se a fila estiver alta e o grupo aceitar perder partes dos ambientes temáticos.'] },
  { id: 'hagrids', number: 3, kind: 'attraction', name: "Hagrid’s Magical Creatures Motorbike Adventure", region: regions.hogsmeade, priority: 'essential', category: 'Montanha-russa', queue: { label: 'Fila normal · avalie no local', detail: 'Não presuma que Single Rider estará disponível ou será mais rápido. Prefira a fila normal para a experiência completa.' }, tips: ['Uma das grandes prioridades do dia. Verifique a fila antes de entrar.', 'Se estiver excessiva, marque “Voltar depois” e continue o percurso.'] },
  { id: 'kong', number: 4, kind: 'attraction', name: 'Skull Island: Reign of Kong', region: regions.skull, priority: 'high', category: 'Expedição imersiva', queue: { label: 'Confira as opções no local', detail: 'Não presuma disponibilidade de Single Rider. Escolha a fila após verificar as opções na entrada.' }, tips: ['Siga pela região de Jurassic Park.', 'Aproveite a parada durante o deslocamento em direção a Toon Lagoon.'] },
  { id: 'dudley', number: 5, kind: 'attraction', name: 'Dudley Do-Right’s Ripsaw Falls', region: regions.toon, priority: 'optional', category: 'Atração aquática', queue: { label: 'Fila normal', detail: 'Prefira o período mais quente do dia, se o clima e a disponibilidade da atração permitirem.' }, tips: ['Molha bastante! Proteja seus pertences.', 'É opcional: escolha conforme o clima e a vontade do grupo.'] },
  { id: 'popeye', number: 6, kind: 'attraction', name: 'Popeye & Bluto’s Bilge-Rat Barges', region: regions.toon, priority: 'optional', category: 'Atração aquática', queue: { label: 'Fila normal', detail: 'Faça após Dudley, caso o grupo queira continuar nas atrações aquáticas.' }, tips: ['Molha muito! Leve isso em conta antes de entrar.', 'Uma parada opcional para aproveitar com o grupo.'] },
  { id: 'spider-man', number: 7, kind: 'attraction', name: 'The Amazing Adventures of Spider-Man', region: regions.marvel, priority: 'essential', category: 'Aventura 3D', queue: { label: 'Confira as opções no local', detail: 'Verifique as filas disponíveis na entrada. Single Rider não é garantido.' }, tips: ['Atração 3D na região Marvel Super Hero Island.'] },
  { id: 'doctor-doom', number: 8, kind: 'attraction', name: 'Doctor Doom’s Fearfall', region: regions.marvel, priority: 'high', category: 'Lançamento vertical', queue: { label: 'Avalie Single Rider no local', detail: 'Considere Single Rider caso esteja disponível e compense para o grupo.' }, tips: ['Uma pausa para encarar um lançamento vertical em Marvel Super Hero Island.'] },
  { id: 'hulk', number: 9, kind: 'attraction', name: 'The Incredible Hulk Coaster', region: regions.marvel, priority: 'essential', category: 'Montanha-russa radical', queue: { label: 'Single Rider, se compensar', detail: 'Utilize Single Rider apenas se estiver disponível e for vantajoso.' }, tips: ['Reserve energia para esta montanha-russa radical.'] },
  { id: 'dark-arts', number: 10, kind: 'attraction', name: 'Dark Arts at Hogwarts Castle', region: regions.hogsmeade, priority: 'essential', category: 'Experiência noturna', conditional: 'Se confirmado', queue: { label: 'Consulte o aplicativo oficial', detail: 'A realização do show e os horários ainda não estão confirmados. Confira previamente no aplicativo oficial.' }, tips: ['Retorne a Hogsmeade no período noturno, se houver apresentação confirmada.', 'O roteiro não garante que o show acontecerá nesta data.'] },
]

export const UNIVERSAL_URL = 'https://www.universalorlando.com/web/en/us/landing-page/mobile-app'
export const parks: Park[] = [
  { id: 'islands-of-adventure', name: 'Universal Islands of Adventure', shortName: 'Islands of Adventure', resort: 'Universal Orlando Resort', date: '2026-10-30', description: 'Dinossauros, magia e uma boa dose de adrenalina. Seu dia de aventura está planejado.', accent: 'teal', arrival: '08h30', opening: '09h00', closing: '20h00', officialUrl: UNIVERSAL_URL, passLabel: 'Sem Express Pass', queueAdvice: 'Single Rider quando compensar', steps,
    preparation: islandsPreparation, dining: islandsDining,
    extras: [
      { name: 'Flight of the Hippogriff', description: 'Uma aventura complementar em Hogsmeade.' },
      { name: 'Explorar Seuss Landing', description: 'Cores e cenários para explorar com calma.' },
      { name: 'Raptor Encounter', description: 'Confira a disponibilidade e os horários no local.' },
      { name: 'Ollivanders', description: 'Um pouco mais de magia no mundo de Harry Potter.' },
      { name: 'Lojas e cenários de Hogsmeade', description: 'Aproveite os detalhes e leve uma lembrança.' },
    ],
    unavailable: [{ name: 'Jurassic Park River Adventure', reason: 'Indicada como fechada para reforma no planejamento da viagem. Verifique a situação nas informações oficiais antes da visita.' }],
  },
  { id: 'universal-studios', name: 'Universal Studios Florida', shortName: 'Universal Studios', resort: 'Universal Orlando Resort', description: 'Entre nos seus filmes favoritos.', accent: 'blue', steps: [], extras: [], unavailable: [] },
  { id: 'epic-universe', name: 'Universal Epic Universe', shortName: 'Epic Universe', resort: 'Universal Orlando Resort', description: 'Novos mundos, novas histórias.', accent: 'purple', steps: [], extras: [], unavailable: [] },
  { id: 'magic-kingdom', name: 'Magic Kingdom', shortName: 'Magic Kingdom', resort: 'Walt Disney World Resort', description: 'Um dia para acreditar em magia.', accent: 'pink', steps: [], extras: [], unavailable: [] },
]
export const activePark = parks[0]
