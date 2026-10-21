import type { ItineraryStep, Park, Region } from '../types'

const r = (id: string, name: string): Region => ({ id, name })
const regions = {
  entrance: r('entrance', 'Entrada do parque'), diagon: r('diagon-alley', 'Diagon Alley'),
  expo: r('world-expo', 'World Expo'), springfield: r('springfield', 'Springfield'),
  et: r('et-area', 'Área próxima à DreamWorks Land'), hollywood: r('hollywood', 'Hollywood'),
  minions: r('minion-land', 'Minion Land'), newYork: r('new-york', 'New York'), london: r('london', 'Londres / King’s Cross'),
}
const normal = { label: 'Fila normal', detail: 'Utilize a fila normal e confira a operação no aplicativo oficial da Universal.' }
const singleRider = { label: 'Single Rider, se disponível e vantajoso', detail: 'Confira a disponibilidade no local e use somente se realmente reduzir a espera. O grupo de oito pessoas poderá ser separado.' }
const steps: ItineraryStep[] = [
  { id: 'studios-arrival', number: 0, kind: 'arrival', name: 'Chegada ao Universal Studios Florida', region: regions.entrance, priority: 'high', category: 'Chegada · fora do progresso', countsTowardProgress: false,
    queue: { label: 'Prepare o grupo para a abertura', detail: 'Chegue à entrada do parque às 09h30, passe pela segurança e prepare os ingressos. A abertura prevista é às 10h00, sujeita à confirmação oficial.' },
    tips: ['09h30 é na entrada, não no estacionamento. Reserve tempo para o deslocamento.', 'Consulte os tempos de espera no aplicativo oficial e confira as sessões de The Bourne Stuntacular.'] },
  { id: 'gringotts', number: 1, kind: 'attraction', name: 'Harry Potter and the Escape from Gringotts', region: regions.diagon, priority: 'essential', category: 'Aventura no banco de Gringotts',
    queue: { label: 'Prefira a fila normal na primeira visita', detail: 'Aproveite os cenários e a ambientação do banco pela fila normal. Utilize Single Rider se estiver disponível e for vantajoso.' },
    tips: ['Primeira atração planejada: siga diretamente para o Beco Diagonal.', 'Conheça a atração localizada dentro do banco de Gringotts.'] },
  { id: 'explore-diagon', number: 2, kind: 'attraction', name: 'Explorar Diagon Alley', region: regions.diagon, priority: 'high', category: 'Lojas, cenários e fotos',
    queue: { label: 'Explore conforme o ritmo do grupo', detail: 'Conheça as lojas e os cenários, observe o dragão soltando fogo se estiver funcionando e tire fotos.' },
    tips: ['Evite prolongar demais a visita se outras atrações estiverem com filas favoráveis.'] },
  { id: 'men-in-black', number: 3, kind: 'attraction', name: 'Men in Black: Alien Attack', region: regions.expo, priority: 'high', category: 'Atração interativa', queue: singleRider,
    tips: ['Compitam acertando alienígenas: uma experiência para aproveitar com o grupo.', 'Single Rider pode separar os oito participantes; avaliem a redução de espera antes de escolher.'] },
  { id: 'simpsons', number: 4, kind: 'attraction', name: 'The Simpsons Ride', region: regions.springfield, priority: 'high', category: 'Simulador', queue: normal,
    tips: ['Aproveite também a região temática de Springfield.', 'O simulador pode causar enjoo em pessoas sensíveis.'] },
  { id: 'studios-lunch', number: 5, displayNumber: 'P', kind: 'pause', name: 'Pausa para almoço', region: regions.springfield, priority: 'optional', category: 'Pausa flexível · fora do progresso', countsTowardProgress: false,
    queue: { label: 'Consulte a aba Alimentação', detail: 'Springfield é uma região conveniente para a parada. Se o grupo não estiver com fome, continue o percurso e almoce depois.' }, tips: ['Não há horário fixo nem restaurante obrigatório.'] },
  { id: 'et-adventure', number: 5, kind: 'attraction', name: 'E.T. Adventure', region: regions.et, priority: 'high', category: 'Clássico em bicicletas', queue: normal,
    tips: ['Embarque em bicicletas para conhecer o universo de E.T.', 'Uma experiência tranquila e nostálgica.'] },
  { id: 'bourne', number: 6, kind: 'attraction', name: 'The Bourne Stuntacular', region: regions.hollywood, priority: 'essential', category: 'Espetáculo ao vivo', plannedTime: null, scheduleNote: 'Consulte as sessões no aplicativo oficial',
    queue: { label: 'Confira as apresentações e reorganize a etapa', detail: 'Espetáculo com dublês, ação, efeitos especiais e cenários tecnológicos. Escolha uma sessão pelo aplicativo oficial; não há horário fixo neste roteiro.' },
    tips: ['Uma das atrações principais: não deixe de fazer apenas por estar fora da sequência geográfica.', 'Reordene esta etapa conforme a apresentação disponível.'] },
  { id: 'minion-mayhem', number: 7, kind: 'attraction', name: 'Despicable Me Minion Mayhem', region: regions.minions, priority: 'high', category: 'Simulador com Gru e os Minions', queue: normal,
    tips: ['Experiência baseada no universo de Meu Malvado Favorito.', 'Villain-Con Minion Blast é complementar: considere se a fila estiver pequena.'] },
  { id: 'transformers', number: 8, kind: 'attraction', name: 'Transformers: The Ride-3D', region: regions.newYork, priority: 'essential', category: 'Simulador de ação em 3D', queue: singleRider,
    tips: ['Efeitos especiais e personagens de Transformers.', 'Avalie Single Rider somente se disponível e vantajoso.'] },
  { id: 'mummy', number: 9, kind: 'attraction', name: 'Revenge of the Mummy', region: regions.newYork, priority: 'essential', category: 'Montanha-russa no escuro', queue: singleRider,
    tips: ['Lançamentos, efeitos especiais e cenários inspirados em A Múmia.', 'Priorize esta atração. Antecipe a etapa se houver uma espera muito menor em outro momento.', 'Não deixe Mummy de fora para realizar atrações opcionais.'] },
  { id: 'jimmy-fallon', number: 10, kind: 'attraction', name: 'Race Through New York Starring Jimmy Fallon', region: regions.newYork, priority: 'optional', category: 'Simulador de corrida por Nova York',
    queue: { label: 'Faça se a espera for favorável', detail: 'Uma opção para encaixar sem comprometer Revenge of the Mummy, Bourne ou o objetivo extra do Hogwarts Express.' }, tips: ['Esta etapa pode ser pulada se o restante do dia pedir mais tempo.'] },
]

export const universalStudios: Park = {
  id: 'universal-studios', name: 'Universal Studios Florida', shortName: 'Universal Studios Florida', resort: 'Universal Orlando Resort', date: '2026-11-03',
  description: 'Cinema, ação e magia — com uma viagem de trem no horizonte.', accent: 'blue', arrival: '09h30', arrivalLabel: 'Na entrada', opening: '10h00',
  officialUrl: 'https://www.universalorlando.com/web/en/us/landing-page/mobile-app', passLabel: 'Sem Express Pass', queueAdvice: 'Single Rider quando disponível e vantajoso', groupSize: 8,
  queueTip: 'O grupo de oito pessoas pode ser separado no Single Rider. Confira também as sessões de Bourne e os horários de funcionamento dos dois parques antes de tentar o trem.',
  progressNote: 'As 10 experiências do roteiro têm progresso próprio. Chegada, pausa para almoço, complementares e objetivo extra não entram no percentual.', steps,
  extraGoals: [{
    id: 'hogwarts-express-hogsmeade', title: 'Objetivo extra — Hogwarts Express e Hogsmeade', region: regions.london,
    possibilitiesTitle: 'Ao chegar em Hogsmeade', officialLabel: 'Informações oficiais do Hogwarts Express',
    description: 'Uma experiência que queremos muito realizar depois das atrações principais: sair do Studios de trem e aproveitar o tempo restante no Islands.',
    steps: ['Seguir até a estação King’s Cross, na região de Londres.', 'Embarcar no Hogwarts Express e viajar do Universal Studios Florida ao Islands of Adventure.', 'Desembarcar em Hogsmeade e aproveitar o tempo restante no Islands.'],
    possibilities: ['Repetir Hagrid’s Magical Creatures Motorbike Adventure.', 'Repetir VelociCoaster.', 'Revisitar as lojas e os cenários de Harry Potter.', 'Consultar atrações pendentes da visita anterior ao Islands.'],
    conditions: ['A realização depende da operação do Hogwarts Express, das filas e dos horários de fechamento dos dois parques. Não há horário fixo nem embarque garantido.', 'O ingresso Park-to-Park permite a viagem entre os parques, conforme sua validade e as condições de funcionamento.', 'Marcar este objetivo não conclui nenhuma atração do Islands nem altera o percentual principal do Studios.'],
    destinationParkId: 'islands-of-adventure', destinationLabel: 'Consultar roteiro do Islands', officialUrl: 'https://www.universalorlando.com/web/pt/br/things-to-do/rides-attractions/hogwarts-express',
  }],
  extras: [
    { name: 'Knight Bus', region: regions.london, priority: 'high', description: 'Ônibus roxo próximo ao Beco Diagonal, com oportunidade de interação e fotos.' },
    { name: 'Ollivanders', region: regions.diagon, priority: 'optional', description: 'Demonstração temática da escolha de uma varinha.' },
    { name: 'Encontro com Transformers', region: regions.newYork, priority: 'high', description: 'Fotos com personagens como Optimus Prime e Bumblebee, conforme disponibilidade e horários.' },
    { name: 'Villain-Con Minion Blast', region: regions.minions, priority: 'optional', description: 'Atração interativa de pontuação inspirada nos vilões de Meu Malvado Favorito.' },
    { name: 'Fotos no globo da Universal', region: regions.entrance, priority: 'optional', description: 'Uma lembrança no tradicional globo da Universal, na entrada do complexo.' },
  ],
  dining: [
    { id: 'krusty-burger', name: 'Fast Food Boulevard / Krusty Burger', type: 'restaurant', typeLabel: 'Refeição rápida', region: regions.springfield, description: 'Área de alimentação dos Simpsons, com hambúrgueres, frango e outras refeições rápidas.', recommendation: 'Krusty Burger.', price: 'Preço a confirmar conforme cardápio atualizado', note: 'Boa opção de almoço pela localização no roteiro.' },
    { id: 'lard-lad', name: 'Lard Lad Donuts', type: 'sweet', region: regions.springfield, description: 'Loja temática dos Simpsons com rosquinhas grandes e coloridas.', recommendation: 'Big Pink Donut.', price: 'Preço a confirmar', note: 'Uma opção para compartilhar entre integrantes do grupo.' },
    { id: 'leaky-cauldron', name: 'Leaky Cauldron — Caldeirão Furado', type: 'restaurant', region: regions.diagon, description: 'Restaurante temático de Harry Potter, com ambiente do Caldeirão Furado e pratos de inspiração britânica.', recommendation: 'Fish and chips e opções tradicionais do cardápio.', price: 'Preço a confirmar conforme cardápio', note: 'Alternativa para almoço ou refeição antecipada na área de Harry Potter.' },
    { id: 'florean-fortescues', name: 'Florean Fortescue’s Ice-Cream Parlour', type: 'sweet', typeLabel: 'Sorveteria', region: regions.diagon, description: 'Sorveteria temática de Harry Potter, com sabores tradicionais e diferentes combinações.', recommendation: 'Sorvete inspirado no sabor Butterbeer.', price: 'Preço a confirmar' },
    { id: 'nathans', name: 'Nathan’s Famous', type: 'snack', region: regions.springfield, description: 'Uma opção de cachorro-quente tradicional americano.', recommendation: 'Hot dog clássico.', price: 'Preço a confirmar', note: 'Região prevista: Springfield. Verifique o ponto de venda e a disponibilidade no dia.' },
  ], priceNotice: 'Preços a confirmar nos cardápios oficiais. Os valores serão em dólares americanos, sujeitos a alterações, e podem não incluir impostos.', unavailable: [],
}
