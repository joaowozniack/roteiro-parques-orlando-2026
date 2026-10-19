# Minha Viagem Orlando 2026

Guia de bolso responsivo em React + TypeScript + Vite. Sem login, backend, banco remoto ou serviços pagos. Primeiro roteiro: **Universal Islands of Adventure, sexta-feira, 30/10/2026**.

## Rodar localmente

Requer Node.js 22.12+ (ou outra versão compatível com o Vite instalado) e npm.

```sh
npm ci
npm run dev
```

Abra a URL exibida pelo Vite. Para produção:

```sh
npm test
npm run build
npm run preview
```

O resultado está em `dist/`. O service worker é gerado no build de produção. Use o preview ou HTTPS no GitHub Pages para verificar o PWA; não abra `index.html` diretamente como arquivo local.

## Publicar gratuitamente no GitHub Pages

1. Crie um repositório público no GitHub e envie estes arquivos, incluindo `package-lock.json` e `.github/workflows/deploy.yml`, para `main` ou `master`.
2. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. Em **Actions**, acompanhe **Publicar guia no GitHub Pages**. O primeiro envio executa testes, build e deploy. Se precisar, inicie manualmente pelo botão **Run workflow**.
4. Abra a URL informada pelo job de publicação, normalmente `https://USUARIO.github.io/REPOSITORIO/`.

O workflow detecta `GITHUB_REPOSITORY` e configura automaticamente o `base` do Vite. Repositórios `USUARIO.github.io` usam `/`. Para domínio próprio ou outro caminho, defina `VITE_BASE_PATH` no ambiente de build (por exemplo `/` ou `/meu-repo/`, sempre com barras nas extremidades). O manifest, os ícones, os assets e o service worker acompanham esse caminho.

O roteamento usa hash (`#/parque/islands-of-adventure`), permitindo atualizar ou abrir links diretos sem depender de regras de servidor ou `404.html`. O repositório está conectado a `joaowozniack/roteiro-parques-orlando-2026` e o Pages já foi ativado. As próximas atualizações são publicadas automaticamente após um push para `main` ou `master`.

## Usar durante a viagem

- A tela inicial mostra os quatro parques. Apenas Islands possui roteiro e data. Os demais ficam preparados para receber dados.
- Abra o roteiro, consulte a estratégia de cada etapa e expanda os detalhes. O destaque indica a primeira etapa **pendente** na ordem atual. Itens para voltar e pulados permanecem acessíveis por filtro.
- Marque como concluída, pule por enquanto ou escolha voltar depois. Nenhuma etapa desaparece no filtro Todas. Os filtros de prioridade e status podem ser combinados.
- O progresso conta **11 etapas: chegada + 10 atrações**, incluindo o show condicionado à confirmação. Complementares não entram nessa conta. Puladas e para voltar não contam como concluídas.
- Toque em **Reordenar** e use Subir/Descer. **Restaurar ordem sugerida** recupera a ordem original sem alterar status ou prioridades.
- As prioridades continuam exibidas nas etiquetas e nos filtros das atrações, mas a edição de prioridade foi removida da interface. Prioridades previamente salvas também são preservadas. As ações podem ser desfeitas pelo aviso ou pelo painel lateral. A sessão mantém as últimas 30 alterações; ao reabrir, ainda é possível alterar qualquer status e restaurar a ordem.
- **Ferramentas** permite exportar/importar JSON e consultar instruções de instalação. A importação valida o conteúdo antes de substituir o progresso e permite desfazer. O backup contém os dados de referência do roteiro e o progresso; importar restaura ordem, status e prioridades previamente salvas das atrações, checklist, tarefas pessoais e opções de alimentação experimentadas dos parques conhecidos pela versão instalada. O conteúdo do roteiro continua definido pelos dados do projeto; o arquivo não é executado como código ou HTML.
- Não há sincronização entre dispositivos. Exporte no primeiro aparelho e importe no segundo. Não há campos de anotações ou tempo de espera, conforme o escopo solicitado.

## Preparação e alimentação

A página do Islands of Adventure tem três abas independentes, com suporte a teclado e links diretos:

- **Preparação** (`#/parque/islands-of-adventure/preparacao`): 23 tarefas fixas em cinco grupos recolhíveis e progresso próprio. Permite acrescentar até 100 tarefas pessoais, com descrição opcional, e excluir somente essas tarefas. Reiniciar exige confirmação, mantém as tarefas pessoais e não altera atrações ou alimentação. Pode ser desfeito. Não há reinício automático à meia-noite.
- **Atrações** (`#/parque/islands-of-adventure/atracoes`): roteiro original e ordem sugerida intactos. O endereço antigo, sem sufixo, continua abrindo esta aba. Os atalhos Voltar depois também abrem as atrações. As prioridades permanecem nas etiquetas e filtros, sem seletor para editá-las.
- **Alimentação** (`#/parque/islands-of-adventure/alimentacao`): Frozen Butterbeer, Three Broomsticks, Green Eggs and Ham Cafe, Honeydukes e Mythos. Pesquisa por nome aceita buscas sem acentos. Filtros por tipo e região podem ser combinados. “Já experimentei” é salvo separadamente e não altera o progresso das atrações. Não há prioridades, ordem obrigatória ou horários de refeição.

Atrações em regiões com opções de alimentação têm um link contextual: por exemplo, Hagrid abre Alimentação filtrada por Hogsmeade. Esse filtro pode ser compartilhado no endereço (`?regiao=hogsmeade`, dentro do hash).

Os preços são as estimativas fornecidas no planejamento, em dólares, sujeitos a alteração e impostos; **não são preços confirmados para 30/10/2026**. Onde não foi fornecido um valor, o cartão informa preço variável e orienta consultar o cardápio. Não há conversão automática para reais.

## Atualizar a publicação existente

Após revisar as alterações, faça commit e push para a branch publicada (`main` ou `master`). Acompanhe o workflow **Publicar guia no GitHub Pages** em Actions. A configuração de Pages existente é reutilizada, sem criar outro site.

O endereço continua sendo [joaowozniack.github.io/roteiro-parques-orlando-2026/](https://joaowozniack.github.io/roteiro-parques-orlando-2026/). No celular, conecte-se à internet e toque em **Atualizar** quando o guia avisar que a nova versão está pronta. A migração preserva o progresso existente, sem precisar limpar os dados do navegador.

## Persistência e offline

O progresso usa `localStorage` em uma chave versionada isolada pelo caminho de instalação: `orlando-guide:/CAMINHO/:progress:v1` (na raiz: `orlando-guide:/:progress:v1`). A mesma chave e a versão 1 do formato foram mantidas para compatibilidade. Ao carregar dados antigos, uma migração aditiva inicializa somente os novos campos, preservando status, ordem e prioridades das atrações. Os domínios `parks`, `preparation`, `dining` e `customTasks` ficam separados dentro do mesmo snapshot, salvo de forma atômica. É salvo imediatamente após cada alteração. Reabrir o mesmo navegador, na mesma origem e caminho de instalação, recupera o estado. Abas da mesma instalação acompanham mudanças; a última gravação prevalece.

Limpar os dados do navegador, usar modo privado ou mudar a origem pode remover ou isolar o progresso. Se o armazenamento estiver indisponível ou cheio, aparece um aviso para exportar um backup. Arquivos incompatíveis são recusados sem substituir o estado atual.

O PWA usa Workbox via `vite-plugin-pwa`, com precache dos arquivos locais, dados embutidos, ilustração e ícones. Não usa fontes, scripts ou imagens de CDN. Abra uma vez com internet e **aguarde “Pronto para usar offline”** antes de sair. Após o cache completo, o guia pode ser recarregado e usado sem rede. O sistema operacional pode remover caches por falta de espaço: vale testar em modo avião antes da viagem e manter um backup do progresso.

No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. No Android: Chrome → Instalar app/Adicionar à tela inicial, ou use o botão de instalação em Ferramentas quando o navegador o disponibilizar. A instalação é opcional para usar o guia.

Novas versões exibem um botão **Atualizar**, preservando o progresso. O indicador de conexão reflete a informação do navegador; o link externo da Universal precisa de internet. Não há dados de fila em tempo real.

Os horários são o planejamento fornecido, sujeitos à confirmação. O show Dark Arts não tem horário inventado nem realização garantida. River Adventure fica fora das paradas ativas, com a indicação de reforma do planejamento e orientação para conferir a situação oficial. Referência: [aplicativo oficial da Universal](https://www.universalorlando.com/web/en/us/landing-page/mobile-app).

## Adicionar parques

Os tipos estão em `src/types.ts`, os roteiros em `src/data/parks.ts` e a preparação/alimentação em `src/data/islands-extras.ts`. Validação, migração e backup ficam em `src/lib/progress.ts`. As novas telas reutilizam o tema em `src/components/Preparation.tsx`, `src/components/Dining.tsx` e `src/sections.css`, integradas por `src/App.tsx`.

Cadastre data, horários, regiões, estratégias, etapas, complementares, indisponíveis e, opcionalmente, os arrays `preparation` e `dining` no objeto `Park`. Use IDs estáveis: eles vinculam os dados ao progresso. As rotas, o progresso e os cartões do roteiro reutilizam os mesmos componentes e selecionam o parque pela URL. A tela inicial libera o link para qualquer parque com etapas cadastradas. `activePark` indica o roteiro em destaque no dashboard e nos atalhos.

A validação completa automaticamente etapas novas ausentes em backups anteriores da mesma versão; alterações incompatíveis de modelo devem ganhar nova versão e migração. O JSON é validado estruturalmente e não é interpretado como HTML.

## Verificação

```sh
npm test
npm run build
```

Para testar a aplicação publicada em um subdiretório, como no GitHub Pages:

```powershell
$env:VITE_BASE_PATH = '/orlando-test/'
npm run build
npm run test:e2e
Remove-Item Env:VITE_BASE_PATH
```

Em bash: `VITE_BASE_PATH=/orlando-test/ npm run build && npm run test:e2e`.

Os testes Playwright cobrem o fluxo móvel, persistência após reload, filtros, prioridades, reordenação, backup, desfazer, migração do formato anterior, tarefas pessoais, confirmação de reinício, independência das três seções, filtros de alimentação, links por região, manifest/ícones em subcaminho e reload offline. Também verificam layouts de 320, 390, 768 e 1440 px. Instale o Chromium de teste com `npx playwright install chromium` antes da primeira execução. As capturas ficam em `test-results/` (ignorado no Git). Asserções unitárias verificam recuperação, migração sem perda de dados e rejeição de backups ou tarefas pessoais inválidos. O workflow executa testes unitários e build; a suíte de navegador é uma verificação local adicional.

Se preferir um Chrome já instalado, defina `PLAYWRIGHT_CHANNEL=chrome` (em PowerShell: `$env:PLAYWRIGHT_CHANNEL = 'chrome'`). A validação realizada neste projeto usou Chrome, incluindo emulação de viewport e toque de iPhone; a instalação em um iPhone/Android físico e o deploy real no GitHub dependem do ambiente de destino.

Os ícones PNG são locais, já incluídos. Para regenerá-los: `node scripts/generate-icons.mjs` (sem bibliotecas extras). A ilustração SVG também é local e editável.

Referências de implementação: [Vite no GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages), [Vite PWA / Workbox](https://vite-pwa-org.netlify.app/workbox/).
