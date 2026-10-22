import type { TripDay } from '../types'

export const tripDays: TripDay[] = [
  { id: '2026-10-27', date: '2026-10-27', title: 'Início da viagem', region: 'Curitiba / viagem internacional', category: 'travel', activities: [
    { id: 'curitiba-airport', name: 'Encontro no Aeroporto Internacional de Curitiba', time: '15:00', location: 'Aeroporto Internacional de Curitiba', category: 'travel' },
    { id: 'outbound-flight', name: 'Embarque para os Estados Unidos', description: 'Voo com conexão no Chile.', notes: 'Confirme os horários detalhados na passagem.', category: 'travel' },
  ] },
  { id: '2026-10-28', date: '2026-10-28', title: 'Chegada aos Estados Unidos e viagem para Orlando', region: 'Miami → Orlando', category: 'travel', notes: 'Priorize deixar as bagagens na hospedagem antes de fazer compras.', activities: [
    { id: 'miami-arrival', name: 'Chegada a Miami e procedimentos de imigração', category: 'travel' },
    { id: 'rental-cars', name: 'Retirada dos carros alugados', category: 'travel' },
    { id: 'drive-orlando', name: 'Viagem de carro de Miami para Orlando', category: 'travel' },
    { id: 'orlando-house', name: 'Chegada à casa alugada', category: 'stay' },
    { id: 'orlando-checkin', name: 'Check-in na hospedagem', category: 'stay' },
    { id: 'walmart', name: 'Compras no Walmart', notes: 'Deixe as bagagens na hospedagem antes das compras.', category: 'shopping' },
  ] },
  { id: '2026-10-29', date: '2026-10-29', title: 'Compras e Disney Springs', region: 'Orlando', category: 'shopping', activities: [
    { id: 'shopping-29', name: 'Dia de compras', category: 'shopping' },
    { id: 'disney-springs', name: 'Passeio pelo Disney Springs', category: 'outing' },
    { id: 'springs-shops-food', name: 'Explorar lojas e opções de alimentação', location: 'Disney Springs', category: 'outing' },
  ] },
  { id: '2026-10-30', date: '2026-10-30', title: 'Islands of Adventure', region: 'Orlando', category: 'park', activities: [
    { id: 'visit-islands', name: 'Visitar o Universal Islands of Adventure', category: 'park', linkedParkId: 'islands-of-adventure' },
    { id: 'dinner-30', name: 'Jantar', category: 'food' },
  ] },
  { id: '2026-10-31', date: '2026-10-31', title: 'Winter Garden e Halloween', region: 'Orlando e arredores', category: 'outing', activities: [
    { id: 'winter-garden', name: 'Passeio por Winter Garden', category: 'outing' },
    { id: 'winter-garden-village', name: 'Compras no Winter Garden Village', category: 'shopping' },
    { id: 'celebration', name: 'Passeio noturno de Halloween em Celebration', notes: 'Planejado para a noite.', category: 'outing' },
  ] },
  { id: '2026-11-01', date: '2026-11-01', title: 'Magic Kingdom', region: 'Walt Disney World', category: 'park', activities: [
    { id: 'visit-magic', name: 'Visitar Magic Kingdom', category: 'park', linkedParkId: 'magic-kingdom' },
    { id: 'magic-shows', name: 'Aproveitar atrações, desfiles e espetáculo de fogos', notes: 'Consulte a programação e os detalhes no roteiro do parque.', category: 'outing' },
  ] },
  { id: '2026-11-02', date: '2026-11-02', title: 'St. Augustine, compras e bar country', region: 'St. Augustine / Orlando', category: 'outing', activities: [
    { id: 'st-augustine', name: 'Passeio por St. Augustine (Santo Agostinho)', category: 'outing' },
    { id: 'shopping-02', name: 'Compras', category: 'shopping' },
    { id: 'country-bar', name: 'Visita a um bar country à noite', notes: 'O bar ainda não está definido.', category: 'outing' },
  ] },
  { id: '2026-11-03', date: '2026-11-03', title: 'Universal Studios Florida e CityWalk', region: 'Orlando', category: 'park', activities: [
    { id: 'visit-studios', name: 'Visitar Universal Studios Florida', category: 'park', linkedParkId: 'universal-studios' },
    { id: 'try-hogwarts', name: 'Tentar utilizar Hogwarts Express até Hogsmeade', description: 'Objetivo extra, sujeito à operação, às filas, ao ingresso válido e aos horários dos dois parques.', notes: 'Confira as condições no objetivo extra do roteiro do Studios. Esta experiência é opcional.', category: 'outing', optional: true },
    { id: 'citywalk', name: 'Passeio no Universal CityWalk', category: 'outing' },
  ] },
  { id: '2026-11-04', date: '2026-11-04', title: 'Compras e BoardWalk', region: 'Orlando', category: 'shopping', activities: [
    { id: 'shopping-04', name: 'Dia de compras', category: 'shopping' },
    { id: 'boardwalk', name: 'Passeio pelo Disney’s BoardWalk', notes: 'É um passeio, não um parque temático.', category: 'outing' },
  ] },
  { id: '2026-11-05', date: '2026-11-05', title: 'Epic Universe e Port Orleans', region: 'Orlando', category: 'park', activities: [
    { id: 'visit-epic', name: 'Visitar Universal Epic Universe', category: 'park', linkedParkId: 'epic-universe' },
    { id: 'port-orleans', name: 'Passeio noturno pelo Disney’s Port Orleans Resort', notes: 'Planejado para a noite, condicionado à disposição do grupo após o parque. Passeio opcional.', category: 'outing', optional: true },
  ] },
  { id: '2026-11-06', date: '2026-11-06', title: 'Viagem para Miami', region: 'Orlando → Miami', category: 'travel', activities: [
    { id: 'orlando-checkout', name: 'Check-out da hospedagem em Orlando', category: 'stay' },
    { id: 'drive-miami', name: 'Viagem de carro para Miami', category: 'travel' },
    { id: 'miami-checkin', name: 'Check-in no hotel em Miami', notes: 'Confirme o hotel e os detalhes na reserva.', category: 'stay' },
    { id: 'outing-06', name: 'Passeio', category: 'outing' },
    { id: 'dinner-06', name: 'Jantar', category: 'food' },
  ] },
  { id: '2026-11-07', date: '2026-11-07', title: 'Miami e jogo do Inter Miami', region: 'Miami', category: 'event', activities: [
    { id: 'miami-outing', name: 'Passeio por Miami', category: 'outing' },
    { id: 'inter-miami', name: 'Jogo do Inter Miami contra Charlotte FC', time: '16:00', location: 'Nu Stadium, Miami', category: 'event', description: 'Horário programado no planejamento fornecido: 16h00, horário local. Sujeito à confirmação de eventuais alterações.', notes: 'Ingressos e participantes a definir. Apenas parte do grupo poderá participar; não considerar que as oito pessoas irão ao jogo.' },
    { id: 'dinner-07', name: 'Jantar', category: 'food' },
  ] },
  { id: '2026-11-08', date: '2026-11-08', title: 'Último dia em Miami e retorno', region: 'Miami / aeroporto', category: 'travel', notes: 'Não comprometa a antecedência necessária para o voo internacional. Confira os horários na passagem e na reserva.', activities: [
    { id: 'miami-checkout', name: 'Check-out do hotel, conforme a reserva', category: 'stay' },
    { id: 'airport-outing', name: 'Passeio próximo ao aeroporto', notes: 'Somente se houver tempo sem comprometer o embarque.', category: 'outing' },
    { id: 'return-cars', name: 'Devolução dos carros alugados', category: 'travel' },
    { id: 'miami-airport', name: 'Ir para o aeroporto de Miami', category: 'travel' },
    { id: 'boarding', name: 'Procedimentos de embarque', category: 'travel' },
    { id: 'return-flight', name: 'Voo de retorno ao Brasil, com conexão em Lima', notes: 'Confirme os horários na passagem.', category: 'travel' },
  ] },
  { id: '2026-11-09', date: '2026-11-09', title: 'Chegada ao Brasil', region: 'Retorno a Curitiba', category: 'travel', activities: [
    { id: 'return-connection', name: 'Conexão e continuação da viagem, conforme as passagens', category: 'travel' },
    { id: 'brazil-arrival', name: 'Chegada ao Brasil', category: 'travel' },
    { id: 'trip-end', name: 'Encerramento da viagem', category: 'outing' },
  ] },
]
