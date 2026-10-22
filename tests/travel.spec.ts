import { expect, test } from '@playwright/test'
import { tripDays } from '../src/data/travel'

test.use({ timezoneId: 'America/Sao_Paulo' })
const key = 'orlando-guide:/orlando-test/:progress:v1'
test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-22T15:00:00Z')) })

test('todos os dias são informativos, estáticos e sem controles de edição ou progresso', async ({ page }) => {
  for (const day of tripDays) {
    await page.goto(`./#/viagem/${day.id}`)
    await expect(page.locator('#trip-day-title')).toHaveText(day.title)
    await expect(page.locator('.trip-activity h3')).toHaveText(day.activities.map(activity => activity.name))
    await expect(page.locator('.trip-date')).toHaveCount(14)
    await expect(page.getByRole('progressbar')).toHaveCount(0)
    await expect(page.locator('.trip-planner input,.trip-planner textarea,.trip-planner select')).toHaveCount(0)
    await expect(page.locator('.trip-planner').getByRole('button', { name: /concluir|pular|editar|adicionar|excluir|ocultar|restaurar|reiniciar|reordenar/i })).toHaveCount(0)
    await expect(page.locator('.activity-status,.trip-day-progress,.activity-actions')).toHaveCount(0)
  }
  expect(await page.evaluate(storageKey => localStorage.getItem(storageKey), key)).toBeNull()
})

test('menus têm exatamente os três nomes e os quatro botões abrem os parques existentes', async ({ page }) => {
  await page.goto('./')
  const names = ['Roteiro da Viagem', 'Parques', 'Checklist Geral']
  for (const [name, width] of [['Navegação principal', 1440], ['Navegação móvel', 390]] as const) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('navigation', { name, exact: true })).toBeVisible()
    expect((await page.getByRole('navigation', { name, exact: true }).locator('a').allTextContents()).map(text => text.trim())).toEqual(names)
  }
  for (const [date, park, title, step] of [
    ['2026-10-30', 'islands-of-adventure', 'Islands of Adventure', 'step-velocicoaster'],
    ['2026-11-01', 'magic-kingdom', 'Magic Kingdom', 'step-big-thunder'],
    ['2026-11-03', 'universal-studios', 'Universal Studios Florida', 'step-gringotts'],
    ['2026-11-05', 'epic-universe', 'Epic Universe', 'step-mario-kart'],
  ]) {
    await page.goto(`./#/viagem/${date}`)
    await page.getByRole('link', { name: `Ver atrações do ${title}`, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#/parque/${park}$`))
    await expect(page.getByTestId(step)).toBeAttached()
    await expect(page.getByRole('tab')).toHaveCount(2)
    await page.getByRole('link', { name: 'Voltar ao Roteiro da Viagem' }).click()
    await expect(page).toHaveURL(/#\/viagem\/2026-10-27$/)
  }
})

test('a entrada abre o dia atual nas cinco datas de referência', async ({ page }) => {
  for (const date of ['2026-10-28', '2026-10-30', '2026-11-01', '2026-11-03', '2026-11-05']) {
    await page.clock.setFixedTime(new Date(`${date}T15:00:00Z`))
    await page.goto('./')
    await page.reload()
    await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Roteiro da Viagem', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#/viagem/${date}$`))
    await expect(page.locator('.trip-date[aria-current=date]')).toHaveAttribute('aria-pressed', 'true')
  }
})

test('dia local, navegação manual estável e nova entrada prioriza hoje mesmo após virar o dia', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-02T03:30:00Z')) // São Paulo: 02/11; Orlando: 01/11.
  await page.goto('./#/viagem')
  await expect(page).toHaveURL(/#\/viagem\/2026-11-02$/)
  await page.locator('.trip-date').filter({ hasText: '07' }).click()
  await page.getByRole('button', { name: 'Dia anterior', exact: true }).click()
  await expect(page.locator('#trip-day-title')).toHaveText('Viagem para Miami')
  await page.getByRole('button', { name: 'Próximo dia', exact: true }).click()
  await expect(page.getByTestId('activity-inter-miami')).toContainText('16h00')
  await expect(page.getByTestId('activity-inter-miami')).toContainText('Ingressos e participantes a definir')
  await page.clock.setFixedTime(new Date('2026-11-03T15:00:00Z'))
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page).toHaveURL(/#\/viagem\/2026-11-07$/)
  await expect(page.locator('.trip-date[aria-current=date]')).toContainText('03')
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Parques', exact: true }).click()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Roteiro da Viagem', exact: true }).click()
  await expect(page).toHaveURL(/#\/viagem\/2026-11-03$/)
  await page.locator('.trip-date').filter({ hasText: '07' }).click()
  await page.getByRole('button', { name: 'Ir para hoje', exact: true }).click()
  await expect(page).toHaveURL(/#\/viagem\/2026-11-03$/)
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Parques', exact: true }).click()
  await page.clock.setFixedTime(new Date('2026-11-04T15:00:00Z'))
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Roteiro da Viagem', exact: true }).click()
  await expect(page).toHaveURL(/#\/viagem\/2026-11-04$/)
})

test('legado diário é ignorado e consultar a agenda não grava nem apaga dados dos parques', async ({ page }) => {
  await page.goto('./#/parque/islands-of-adventure')
  await page.getByTestId('step-hagrids').getByRole('button', { name: /^Voltar depois:/ }).click()
  await page.evaluate(storageKey => {
    const state = JSON.parse(localStorage.getItem(storageKey)!)
    state.trip = { selectedDay: '2026-11-07', viewedOn: '2026-10-22', days: { '2026-10-27': { order: ['outbound-flight'], hidden: ['curitiba-airport'], edits: { 'outbound-flight': { name: 'Texto antigo' } }, statuses: { 'outbound-flight': 'completed' }, customActivities: [{ id: 'trip-personal-old', name: 'Atividade antiga', category: 'food' }] } } }
    state.globalChecklist.checked.tickets = true
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, key)
  const original = await page.evaluate(storageKey => localStorage.getItem(storageKey), key)
  await page.reload()
  await page.goto('./#/viagem')
  await expect(page.locator('.trip-activity h3')).toHaveText(tripDays[0].activities.map(activity => activity.name))
  await expect(page.getByRole('progressbar')).toHaveCount(0)
  expect(await page.evaluate(storageKey => localStorage.getItem(storageKey), key)).toBe(original)
  await page.goto('./#/parque/islands-of-adventure')
  await expect(page.getByTestId('step-hagrids')).toHaveClass(/status-later/)
  await page.getByTestId('step-velocicoaster').getByRole('button', { name: /^Concluir / }).click()
  await page.getByRole('button', { name: 'Abrir ferramentas da viagem' }).click()
  await page.getByRole('button', { name: /Atrações para voltar depois/ }).click()
  await expect(page.getByLabel('Mostrar', { exact: true })).toHaveValue('later')
  await expect(page.getByTestId('step-hagrids')).toBeVisible()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Checklist Geral', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Conferir ingressos.', exact: true })).toBeChecked()
})

test('consulta offline funciona e links mantêm a interatividade dos parques', async ({ page, context }) => {
  await page.goto('./#/viagem')
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect(page.locator('.connection')).toContainText('Pronto para usar offline', { timeout: 20000 })
  await page.reload()
  await context.setOffline(true)
  await page.reload()
  await page.goto('./#/viagem/2026-11-05')
  await expect(page.getByTestId('activity-port-orleans')).toContainText('condicionado à disposição do grupo')
  await expect(page.getByRole('progressbar')).toHaveCount(0)
  await page.getByRole('link', { name: 'Ver atrações do Epic Universe', exact: true }).click()
  await page.getByTestId('step-mario-kart').getByRole('button', { name: /^Concluir / }).click()
  await page.reload()
  await expect(page.getByTestId('step-mario-kart')).toHaveClass(/status-completed/)
  await page.getByRole('tab', { name: 'Alimentação', exact: true }).click()
  await page.getByTestId('food-mead-hall').getByRole('checkbox').check()
  await page.reload()
  await expect(page.getByTestId('food-mead-hall').getByRole('checkbox')).toBeChecked()
})

test('agenda e navegação responsivas nos dois temas', async ({ page }) => {
  test.setTimeout(60_000)
  for (const theme of ['dark', 'light']) {
    await page.goto('./')
    if (theme === 'light') await page.getByRole('button', { name: 'Ativar modo claro' }).click()
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const [name, path] of [['home', './'], ['day', './#/viagem/2026-10-28'], ['game', './#/viagem/2026-11-07']]) {
        await page.goto(path)
        await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
        await expect(page.getByRole('button', { name: 'Abrir ferramentas da viagem' })).toBeVisible()
        if (width === 390 || width === 1440) {
          if (name === 'home') await page.locator('.travel-entry').scrollIntoViewIfNeeded()
          else await page.locator('.trip-timeline').scrollIntoViewIfNeeded()
          await page.screenshot({ path: `test-results/travel-readonly-${name}-${theme}-${width}.png` })
        }
      }
    }
  }
})
