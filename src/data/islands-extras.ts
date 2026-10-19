import type { FoodOption, PreparationGroup } from '../types'

export const islandsPreparation: PreparationGroup[] = [
  { id: 'documents', name: 'Documentos e ingressos', tasks: [
    { id: 'tickets', name: 'Conferir ingressos de todos os visitantes.' },
    { id: 'mobile-tickets', name: 'Verificar se os ingressos estão acessíveis no celular.' },
    { id: 'park-hours', name: 'Conferir horário de funcionamento do parque.', description: 'Confirme no aplicativo oficial da Universal.' },
    { id: 'show-updates', name: 'Confirmar se há alterações nas atrações ou shows.' },
  ] },
  { id: 'phone', name: 'Celular e aplicativos', tasks: [
    { id: 'charge-phone', name: 'Carregar o celular.' },
    { id: 'power-bank', name: 'Levar power bank carregado.' },
    { id: 'mobile-data', name: 'Conferir internet móvel/eSIM.' },
    { id: 'universal-app', name: 'Abrir o aplicativo oficial da Universal.' },
    { id: 'gps', name: 'Verificar o trajeto até o estacionamento pelo GPS.' },
  ] },
  { id: 'backpack', name: 'Mochila e itens pessoais', tasks: [
    { id: 'water', name: 'Levar garrafa de água.' },
    { id: 'snacks', name: 'Separar pequenos snacks permitidos pelo parque.', description: 'Confira as regras oficiais sobre alimentos antes de preparar a mochila.' },
    { id: 'sunscreen', name: 'Levar protetor solar.' },
    { id: 'poncho', name: 'Levar capa de chuva ou poncho.' },
    { id: 'waterproof-bag', name: 'Levar saco impermeável para proteger itens nas atrações aquáticas.' },
    { id: 'comfortable-clothes', name: 'Usar roupas e calçados confortáveis.' },
    { id: 'weather', name: 'Conferir a previsão do tempo.' },
  ] },
  { id: 'group', name: 'Organização do grupo', tasks: [
    { id: 'departure-time', name: 'Combinar o horário de saída da hospedagem.' },
    { id: 'everyone-ready', name: 'Confirmar que todos estão prontos.' },
    { id: 'meeting-point', name: 'Combinar um ponto de encontro em caso de separação.' },
    { id: 'single-rider-plan', name: 'Reforçar que utilizaremos Single Rider quando compensar.', description: 'O grupo pode ser separado; confira as opções em cada atração.' },
    { id: 'breakfast', name: 'Fazer um bom café da manhã antes de sair.' },
  ] },
  { id: 'getting-there', name: 'Chegada', tasks: [
    { id: 'leave-early', name: 'Sair com antecedência suficiente.' },
    { id: 'entrance-0830', name: 'Estar na entrada do parque por volta das 08h30.', description: '08h30 é na entrada do Islands of Adventure, não no estacionamento.' },
  ] },
]

const hogsmeade = { id: 'hogsmeade', name: 'Hogsmeade' }
// User-provided reference estimates, not confirmed prices for the visit.
export const islandsDining: FoodOption[] = [
  { id: 'frozen-butterbeer', name: 'Frozen Butterbeer — Cerveja amanteigada', type: 'drink', region: hogsmeade,
    description: 'Bebida sem álcool inspirada em Harry Potter, com sabor doce que lembra caramelo amanteigado. A versão Frozen é gelada e cremosa.',
    recommendation: 'Frozen Butterbeer.', price: 'US$ 9–10', note: 'Boa opção para experimentar enquanto estiver em Hogsmeade, nos pontos de venda de Butterbeer.' },
  { id: 'three-broomsticks', name: 'Three Broomsticks — Três Vassouras', type: 'restaurant', region: hogsmeade,
    description: 'Restaurante inspirado no universo de Harry Potter, com decoração temática e pratos como frango assado, costelas e fish and chips.',
    recommendation: 'Pratos de frango assado e costelas.', price: 'US$ 16–23 por prato principal', note: 'Pode ser uma opção de almoço se o grupo estiver próximo à região.' },
  { id: 'green-eggs', name: 'Green Eggs and Ham Cafe', type: 'snack', region: { id: 'seuss', name: 'Seuss Landing' },
    description: 'Estabelecimento temático conhecido pelos tater tots, pequenas batatas crocantes servidas com diferentes acompanhamentos.',
    recommendation: 'Tater tots com queijo e acompanhamentos.', price: 'US$ 13–16', note: 'Boa opção para dividir um lanche.' },
  { id: 'honeydukes', name: 'Honeydukes', type: 'sweet', region: hogsmeade,
    description: 'Loja de doces do universo de Harry Potter, com chocolates, confeitos e produtos temáticos.',
    recommendation: 'Cauldron Cake, Chocolate Frog e Bertie Bott’s Every-Flavour Beans.', price: 'Variável conforme o produto', note: 'Também é interessante para conhecer e comprar lembranças.' },
  { id: 'mythos', name: 'Mythos Restaurant', type: 'restaurant', region: { id: 'lost-continent', name: 'The Lost Continent' },
    description: 'Restaurante com serviço de mesa e arquitetura inspirada em cavernas e elementos mitológicos, oferecendo uma refeição mais elaborada.',
    recommendation: 'Consultar cardápio vigente.', price: 'Variável · consultar cardápio oficial', note: 'Pode exigir uma parada mais longa.' },
]
