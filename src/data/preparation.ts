import type { PreparationGroup } from '../types'

// Keep equivalent legacy task IDs so existing checkmarks migrate unchanged.
export const preparationGroups: PreparationGroup[] = [
  { id: 'documents', name: 'Documentos', tasks: [
    { id: 'tickets', name: 'Conferir ingressos.' },
    { id: 'mobile-tickets', name: 'Garantir que os ingressos estão acessíveis no celular.' },
    { id: 'park-hours', name: 'Conferir horário de abertura e fechamento.' },
    { id: 'maintenance', name: 'Conferir atrações em manutenção.' },
    { id: 'show-updates', name: 'Verificar apresentações e shows do dia.' },
  ] },
  { id: 'phone', name: 'Celular', tasks: [
    { id: 'charge-phone', name: 'Carregar celulares.' },
    { id: 'power-bank', name: 'Carregar power banks.' },
    { id: 'mobile-data', name: 'Conferir internet móvel.' },
    { id: 'universal-app', name: 'Abrir aplicativo oficial do parque.' },
    { id: 'gps', name: 'Conferir GPS até o estacionamento.' },
  ] },
  { id: 'backpack', name: 'Mochila', tasks: [
    { id: 'water', name: 'Separar garrafas de água.' },
    { id: 'snacks', name: 'Separar snacks permitidos.', description: 'Confira as regras oficiais do parque antes de preparar a mochila.' },
    { id: 'sunscreen', name: 'Levar protetor solar.' },
    { id: 'poncho', name: 'Levar capa de chuva ou poncho.' },
    { id: 'waterproof-bag', name: 'Levar proteção impermeável para objetos.' },
    { id: 'comfortable-clothes', name: 'Utilizar roupas e calçados confortáveis.' },
    { id: 'weather', name: 'Conferir previsão do tempo.' },
  ] },
  { id: 'group', name: 'Organização', tasks: [
    { id: 'breakfast', name: 'Tomar café da manhã.' },
    { id: 'departure-time', name: 'Combinar horário de saída.' },
    { id: 'everyone-ready', name: 'Verificar se todos estão prontos.' },
    { id: 'meeting-point', name: 'Definir ponto de encontro em caso de separação.' },
    { id: 'park-address', name: 'Conferir endereço do parque.' },
  ] },
]
