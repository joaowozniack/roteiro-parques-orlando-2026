# Minha Viagem Orlando 2026

Guia de bolso em React + TypeScript + Vite, responsivo e instalável como PWA. Sem login, backend, banco remoto ou serviços pagos.

Roteiros disponíveis:

- **Islands of Adventure — 30/10/2026.** Roteiro e alimentação originais preservados.
- **Magic Kingdom — 01/11/2026.** Atrações, transporte e alimentação cadastrados.
- **Universal Studios Florida — 03/11/2026.** Roteiro, alimentação e objetivo extra do Hogwarts Express.
- Epic Universe aguarda cadastro.

## Rodar e gerar o build

Requer Node.js 22.12+ e npm.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

O resultado fica em `dist/`. O service worker é gerado no build de produção. Para verificar o PWA use o preview ou o site em HTTPS, sem abrir o HTML diretamente como arquivo.

## Publicação e atualização no GitHub Pages

O repositório está conectado a `joaowozniack/roteiro-parques-orlando-2026`, com Pages já habilitado. Faça commit das alterações e push para `master` (ou `main`, também aceita pelo workflow). Inclua os novos arquivos de dados, componentes, estilos e testes.

O workflow **Publicar guia no GitHub Pages** executa instalação pelo lockfile, testes, build e deploy. Acompanhe a execução em Actions. A publicação continua em [joaowozniack.github.io/roteiro-parques-orlando-2026/](https://joaowozniack.github.io/roteiro-parques-orlando-2026/).

Para uma instalação nova: em Settings → Pages → Build and deployment → Source, selecione **GitHub Actions**. O `base` do Vite é detectado por `GITHUB_REPOSITORY`; repositórios `USUARIO.github.io` usam `/`. Um domínio próprio ou outro caminho pode definir `VITE_BASE_PATH`, sempre com barras nas extremidades.

No celular, conecte-se à internet e toque em **Atualizar** quando o guia avisar que a nova versão está pronta. O progresso continua no mesmo armazenamento; não é necessário limpar os dados do navegador.

## Checklist geral

A tela inicial e a navegação oferecem **Checklist geral de preparação**, em `#/preparacao`. Ele é compartilhado pelos quatro parques e representa a preparação para o **próximo dia de parque**, sem criar histórico por data.

São 22 tarefas fixas nos grupos Documentos, Celular, Mochila e Organização. É possível marcar/desmarcar, recolher grupos, acompanhar o percentual, adicionar até 100 tarefas pessoais, editar o nome e a descrição delas e excluir somente tarefas pessoais. As ações permitem desfazer durante a sessão.

**Reiniciar checklist** exige confirmação, deixa as tarefas pendentes e mantém as tarefas pessoais. Não altera atrações nem alimentação. Não há reinício automático à meia-noite ou ao trocar de parque.

A aba Preparação foi removida dos parques. Endereços antigos, como `#/parque/islands-of-adventure/preparacao`, encaminham ao checklist geral.

## Atrações e alimentação

O destaque da tela inicial acompanha o **calendário de Orlando (America/New_York)** e o progresso. Mostra o parque do dia ou o próximo agendado ainda não concluído; atingir 100% adianta o próximo parque, mesmo antes da data. Assim, Islands aparece antes e em 30/10; Magic passa ao destaque ao concluir Islands ou a partir de 31/10, no intervalo até sua visita em 01/11. Studios entra em destaque a partir de 02/11 ou antes, se os parques anteriores chegarem a 100%. A virada do dia é conferida automaticamente e ao voltar ao app, inclusive offline.

Parques anteriores continuam acessíveis nos cartões menores com seu progresso intacto. Quando todos os próximos roteiros estiverem concluídos, o último permanece em destaque com “Rever roteiro”; parques aguardando cadastro não são promovidos. Nada reinicia o checklist ou o progresso durante essa troca. Os atalhos da tela inicial e o painel “O próximo destino” acompanham o novo destaque.

Cada parque possui apenas duas abas:

- **Atrações:** prioridades, detalhes e estratégias; status Pendente, Concluída, Pulada e Voltar depois; filtros de status/prioridade; reordenação e restauração da ordem sugerida. As prioridades permanecem visíveis e as prioridades antigas salvas são preservadas; o editor de prioridade continua removido.
- **Alimentação:** pesquisa por nome, inclusive sem acentos, filtros combinados por tipo e região e marcação “Já experimentei”. Sem prioridades, horários fixos ou ordem obrigatória. Atrações com opções na mesma região oferecem um link para a alimentação já filtrada.

Os dados de atrações, refeições e objetivos extras de cada parque são independentes. Os links de navegação preservam o parque atual. Não há campos de tempo de espera nem anotações pessoais nas atrações.

### Magic Kingdom

Planejamento fornecido para 01/11/2026: chegada às **07h30 no estacionamento**, abertura prevista às **09h00**, fechamento previsto às **22h00**, sem Lightning Lane e sem depender de Single Rider. Transporte: monorail na ida e balsa ao TTC na volta.

Os horários são referências do planejamento, sujeitos à confirmação. O desfile Festival of Fantasy está previsto para 14h00, com posicionamento por volta de 13h35; Happily Ever After está previsto para 20h00, com posicionamento 45 a 60 minutos antes. **Disney Starlight tem `plannedTime: null`**, mostra “Aguardando divulgação do horário” e pode ser reordenado quando a programação for divulgada.

**Buzz Lightyear’s Space Ranger Spin está somente em “Se sobrar tempo”**, conforme a alteração solicitada, junto a Jungle Cruise, Peter Pan’s Flight, It’s a Small World, Mickey’s PhilharMagic, Under the Sea e The Many Adventures of Winnie the Pooh. Complementares não são inseridas automaticamente no roteiro.

O roteiro tem **17 cartões e 15 etapas contadas no progresso**: a pausa para almoço pode ser marcada, mas não conta; as oportunidades de TRON à tarde e à noite mantêm status individuais e contam **uma única vez** no progresso. Uma volta conclui a atração, a repetição é opcional e a outra oportunidade deixa de ser indicada como próxima etapa obrigatória.

A alimentação inclui Pecos Bill, Columbia Harbour House, Sleepy Hollow, Aloha Isle, Casey’s Corner, Plaza Ice Cream Parlor e Liberty Square Market. Os valores são referências fornecidas no planejamento em dólares, sujeitos a alterações e impostos. Onde não há valor informado, o app orienta confirmar o cardápio. Não há conversão fictícia para reais.

Confira a programação no [My Disney Experience oficial](https://disneyworld.disney.go.com/en_CA/guest-services/my-disney-experience/mobile-apps/). O roteiro não garante operação, preços ou horários para a data da visita.

### Universal Studios Florida

Visita em **03/11/2026 (terça-feira)**, grupo de oito pessoas. Chegada planejada às **09h30 na entrada do parque**, abertura prevista às **10h00**, sem Express Pass e com Single Rider somente quando disponível e vantajoso. O fechamento não foi informado: o app mostra “A confirmar”, sem inventar horário.

O roteiro mantém a sequência solicitada: chegada, Gringotts, explorar Diagon Alley, Men in Black, Simpsons, pausa flexível para almoço, E.T., Bourne, Minion Mayhem, Transformers, Mummy e Jimmy Fallon. A pausa usa o marcador “P”, preservando a numeração das dez experiências do arquivo de planejamento.

São **12 cartões e 10 experiências contadas no progresso**. A chegada, a pausa para almoço, os complementares e o objetivo extra ficam fora do percentual. Bourne tem `plannedTime: null`, com orientação para consultar as sessões no aplicativo e reordenar conforme a programação. Não há horários fixos nas atrações.

Complementares: Knight Bus, Ollivanders, encontro com Transformers, Villain-Con Minion Blast e fotos no globo da Universal. Refeições: Krusty Burger/Fast Food Boulevard, Lard Lad Donuts, Leaky Cauldron, Florean Fortescue’s e Nathan’s Famous. **Todos os preços ficam a confirmar**, sem números fictícios. Filtros, pesquisa, “Já experimentei” e links de alimentação por região reutilizam os componentes existentes.

### Hogwarts Express: objetivo extra e experiência complementar

No final do Studios, **Objetivo extra — Hogwarts Express e Hogsmeade** tem descrição, trajeto King’s Cross → Hogsmeade, possibilidades no Islands e condições de realização. O ingresso Park-to-Park deve ser válido; operação do trem, filas e fechamento dos parques podem impedir a experiência. Nenhum horário ou embarque é garantido. Referência: [Hogwarts Express oficial](https://www.universalorlando.com/web/pt/br/things-to-do/rides-attractions/hogwarts-express).

O objetivo tem estado próprio: **Pendente**, **Concluído** ou **Não realizado**, salvo automaticamente e com possibilidade de desfazer. Não possui prioridade, não entra no percentual do Studios e não conclui nenhuma atração do Islands. Um link permite consultar o roteiro do parque de destino. A estrutura é reutilizável para novos objetivos em outros parques.

No **Islands**, o trem foi acrescentado somente a **Se sobrar tempo**, sem alterar suas 11 etapas ou o progresso. O cartão informa que o conteúdo da viagem difere no sentido contrário e que o planejamento prefere usar o trem no dia do Studios, em 03/11. Não existe objetivo extra do Islands.

## Persistência, migração e backups

A chave anterior é mantida: `orlando-guide:/CAMINHO/:progress:v1` (na raiz, `orlando-guide:/:progress:v1`). Salvar é imediato e automático; a última gravação entre abas da mesma instalação prevalece. Se o armazenamento falhar, o guia avisa para exportar um backup.

A migração é aditiva:

- `parks` preserva status, prioridades salvas e ordem de cada parque. O Magic Kingdom ganha apenas seus próprios valores iniciais.
- `dining` mantém as marcações de alimentação por parque.
- `extraGoals` guarda os estados dos objetivos extras por parque. Snapshots antigos sem esse domínio ganham apenas os novos objetivos em estado Pendente; os dados existentes não são apagados.
- O antigo cadastro vazio de `universal-studios` recebe suas novas etapas sem alterar os registros do Islands, Magic ou checklist geral.
- `globalChecklist` passa a conter marcações e tarefas pessoais compartilhadas.
- Ao ler um snapshot sem `globalChecklist`, as tarefas pessoais do Islands e as marcações de tarefas correspondentes são copiadas para o checklist geral. IDs equivalentes foram mantidos.
- Os campos antigos `preparation` e `customTasks` por parque são preservados no snapshot para compatibilidade e backup, incluindo os itens antigos que não se aplicam ao checklist geral. Não são mais editados pela interface.
- A presença de `globalChecklist` impede reaplicar a migração após reiniciar ou editar o checklist.

**Ferramentas** exporta/importa o roteiro e todo o progresso em JSON, incluindo o checklist geral e os objetivos extras. Backups de versões anteriores continuam aceitos e são migrados. A importação valida o conteúdo antes de substituir o estado e permite desfazer. O arquivo de referência não altera os dados do roteiro nem executa HTML ou código externo.

Não há sincronização entre celulares. Exporte em um dispositivo e importe em outro. Limpar o armazenamento ou mudar a origem/caminho da instalação pode isolar ou remover o progresso.

## Offline e instalação

O PWA usa Workbox via `vite-plugin-pwa`, com precache dos dados embutidos, arquivos, ícones e ilustração locais. Não usa CDN para funções essenciais. Após o primeiro carregamento online completo, aguarde **Pronto para usar offline**. O checklist geral e os três parques podem ser recarregados e usados offline. Links oficiais dependem de internet.

No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. No Android: Chrome → Instalar app/Adicionar à tela inicial, ou o botão em Ferramentas quando disponível. A instalação é opcional. Teste em modo avião antes da visita e mantenha backup; o sistema pode remover caches por falta de espaço.

## Estrutura

- `src/data/parks.ts`: cadastro dos parques e roteiro original do Islands.
- `src/data/universal-studios.ts`: roteiro, alimentação, complementares e objetivo extra do Studios.
- `src/components/ExtraGoals.tsx` e `src/goals.css`: cartões reutilizáveis de objetivo extra, sem categorias de prioridade.
- `src/data/magic-kingdom.ts`: roteiro, alimentação, horários previstos/nulos e complementares do Magic.
- `src/data/preparation.ts`: checklist geral, com IDs compatíveis com a versão anterior.
- `src/data/islands-extras.ts`: alimentação do Islands e checklist antigo mantido para migração.
- `src/lib/progress.ts`: validação, migração, backups, reordenação e contagem de etapas únicas.
- `src/components/Preparation.tsx`: checklist geral e edição de tarefas pessoais.
- `src/components/Dining.tsx`: alimentação reutilizada pelos três parques.
- `src/App.tsx`, `src/styles.css`, `src/sections.css`, `src/trip.css`: interface e navegação.

Para cadastrar novos parques, use um ID estável e acrescente dados ao array `parks`. Regiões, estratégias e alimentação são dados; os componentes são compartilhados. Objetivos extras são dados no array `Park.extraGoals` e usam estados separados em `GuideState.extraGoals`. Títulos de possibilidades, links, condições e parque de destino ficam nos dados. Pausas usam `kind: 'pause'`; oportunidades repetidas usam o mesmo `completionGroup`; horários não confirmados devem ser `null`, nunca inventados.

## Testes

```sh
npm test
npm run build
```

Para reproduzir o subdiretório do Pages nos testes de navegador:

```powershell
$env:VITE_BASE_PATH = '/orlando-test/'
npm run build
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
Remove-Item Env:VITE_BASE_PATH
```

Alternativamente, instale o Chromium de teste com `npx playwright install chromium` e omita `PLAYWRIGHT_CHANNEL`. O workflow executa testes unitários e build; a suíte Playwright é uma verificação local adicional.

Os testes cobrem migração, preservação de dados, edição/reset do checklist, independência dos parques, pausa e TRON no progresso, Starlight sem horário, Buzz complementar, Studios na ordem solicitada, Bourne sem horário fixo, Hogwarts como meta independente, migração de objetivos e preços a confirmar, filtros/pesquisa, backup, falhas de armazenamento, navegação offline e layouts de 320, 390, 768 e 1440 px. Capturas ficam em `test-results/` (ignorado no Git). A verificação usa Chrome com emulação de toque e viewport; instalação em aparelhos físicos e deploy real dependem do ambiente de destino.

Os ícones PNG já estão incluídos e podem ser regenerados sem bibliotecas extras com `node scripts/generate-icons.mjs`. A ilustração SVG é local.
