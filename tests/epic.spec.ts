import { expect, test } from '@playwright/test'

const route = './#/parque/epic-universe'
const key = 'orlando-guide:/orlando-test/:progress:v1'
test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-21T12:00:00Z')) })

test('Epic: estratégia, avisos, sessões, prioridades e ordem manual persistida', async ({ page }) => {
  await page.goto(route)
  await expect(page.getByRole('tab')).toHaveCount(2)
  await expect(page.locator('.step-card')).toHaveCount(14)
  await expect(page.locator('.day-strategy')).toContainText('Estratégia do dia')
  await expect(page.locator('.day-facts')).toContainText('No estacionamento09h00')
  await expect(page.locator('.day-strategy a')).toHaveAttribute('href', /universalorlando.com/)
  for (const id of ['mario-kart', 'mine-cart', 'battle-ministry']) {
    const card = page.getByTestId(`step-${id}`)
    await expect(card.locator('.detail-notice')).toHaveCount(0)
    await card.getByRole('button', { name: /^Expandir detalhes/ }).click()
    await expect(card.locator('.detail-notice')).toContainText('Se o grupo considerar a espera aceitável')
  }
  await expect(page.getByTestId('step-battle-ministry').locator('.detail-warning')).toContainText('antecipada a qualquer momento')
  for (const id of ['untrainable-dragon', 'cirque-arcanus', 'celestial-goodnight']) await expect(page.getByTestId(`step-${id}`).locator('.step-schedule')).not.toContainText(/\d{2}h\d{2}/)
  await page.getByRole('button', { name: 'Reordenar', exact: true }).click()
  await page.getByTestId('step-mine-cart').getByRole('button', { name: /para cima/ }).click()
  await page.reload()
  await expect(page.locator('.step-card').nth(1)).toHaveAttribute('id', 'step-mine-cart')
  await page.getByRole('button', { name: 'Restaurar ordem sugerida' }).click()
  await expect(page.locator('.step-card').nth(1)).toHaveAttribute('id', 'step-mario-kart')
  await page.getByTestId('step-mario-kart').getByRole('button', { name: /^Voltar depois:/ }).click()
  await page.getByLabel('Mostrar', { exact: true }).selectOption('later')
  await expect(page.locator('.step-card')).toHaveCount(1)
})

test('Stardust conta uma vez; show indisponível permite 100%, desfazer e retomar', async ({ page }) => {
  await page.goto(route)
  await page.getByTestId('step-stardust-first').getByRole('button', { name: /^Concluir / }).click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '9')
  await expect(page.getByTestId('step-stardust-night')).toContainText('Stardust Racers já concluída')
  await page.getByTestId('step-stardust-night').getByRole('button', { name: /^Concluir / }).click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '9')
  const cards = page.locator('.step-card:not(#step-celestial-goodnight)')
  // Complete all remaining experiences; arrival and lunch still do not count.
  for (const card of await cards.all()) {
    const button = card.getByRole('button', { name: /^Concluir / })
    if (await button.count()) await button.click()
  }
  const show = page.getByTestId('step-celestial-goodnight')
  await show.getByRole('button', { name: 'Marcar indisponível' }).click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '100')
  await expect(page.locator('.mobile-progress')).toContainText('10 de 10')
  await page.locator('.toast').getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '91')
  await show.getByRole('button', { name: 'Marcar indisponível' }).click()
  await page.reload()
  await expect(show).toHaveClass(/status-unavailable/)
  await show.getByRole('button', { name: 'Retomar apresentação' }).click()
  await expect(page.locator('.mobile-progress')).toContainText('10 de 11')
})

test('alimentação, backup e migração preservam os quatro parques e checklist', async ({ page }) => {
  await page.goto('./#/parque/islands-of-adventure')
  await page.getByTestId('step-hagrids').getByRole('button', { name: /^Voltar depois:/ }).click()
  await page.evaluate(storageKey => {
    const state = JSON.parse(localStorage.getItem(storageKey)!)
    state.parks['epic-universe'] = { order: [], statuses: {}, priorities: {} }
    state.parks['magic-kingdom'].statuses['big-thunder'] = 'completed'
    state.extraGoals['universal-studios']['hogwarts-express-hogsmeade'] = 'completed'
    state.globalChecklist.checked.tickets = true
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, key)
  await page.goto(route)
  await page.reload()
  await page.getByTestId('step-celestial-goodnight').getByRole('button', { name: 'Marcar indisponível' }).click()
  await page.getByRole('tab', { name: 'Alimentação', exact: true }).click()
  await expect(page.locator('.food-card')).toHaveCount(8)
  await expect(page.locator('.food-card .priority-badge')).toHaveCount(0)
  await page.getByRole('button', { name: 'Bebidas', exact: true }).click()
  await expect(page.locator('.food-card')).toHaveCount(1)
  await expect(page.getByTestId('food-burning-blade')).toBeVisible()
  await page.getByRole('button', { name: 'Todos', exact: true }).click()
  await page.getByRole('searchbox').fill('mead')
  await page.getByTestId('food-mead-hall').getByRole('checkbox').check()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('button', { name: 'Ferramentas', exact: true }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar roteiro e progresso' }).click()
  const path = await (await download).path()
  await page.locator('input[type=file]').setInputFiles(path!)
  await page.reload()
  await expect(page.getByTestId('food-mead-hall').getByRole('checkbox')).toBeChecked()
  const state = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!), key)
  expect(state.parks['islands-of-adventure'].statuses.hagrids).toBe('later')
  expect(state.parks['magic-kingdom'].statuses['big-thunder']).toBe('completed')
  expect(state.extraGoals['universal-studios']['hogwarts-express-hogsmeade']).toBe('completed')
  expect(state.globalChecklist.checked.tickets).toBe(true)
  expect(state.parks['epic-universe'].statuses['celestial-goodnight']).toBe('unavailable')
})

test('Epic e alimentação funcionam offline; destaque e layouts móveis', async ({ page, context }) => {
  await page.clock.setFixedTime(new Date('2026-11-05T15:00:00Z'))
  await page.goto('./')
  await expect(page.locator('.featured-park h2')).toHaveText('Epic Universe')
  await expect(page.locator('.featured-date strong')).toHaveText('05 NOV')
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect(page.locator('.connection')).toContainText('Pronto para usar offline', { timeout: 20000 })
  await page.reload()
  await context.setOffline(true)
  await page.goto(route)
  await page.getByTestId('step-mario-kart').getByRole('button', { name: /^Concluir / }).click()
  await page.reload()
  await expect(page.getByTestId('step-mario-kart')).toHaveClass(/status-completed/)
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
    await page.locator('.day-strategy').scrollIntoViewIfNeeded()
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/epic-strategy-${width}.png` })
  }
  await page.getByRole('tab', { name: 'Alimentação', exact: true }).click()
  await page.getByTestId('food-mead-hall').getByRole('checkbox').check()
  await page.reload()
  await expect(page.getByTestId('food-mead-hall').getByRole('checkbox')).toBeChecked()
  await expect(page.locator('.connection')).toContainText('Você está offline')
})
