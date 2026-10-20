import { test, expect } from '@playwright/test'

const magic = './#/parque/magic-kingdom'
const islands = './#/parque/islands-of-adventure'
const key = 'orlando-guide:/orlando-test/:progress:v1'
let errors: string[] = []
test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-20T12:00:00Z')); errors = []; page.on('pageerror', error => errors.push(error.message)) })
test.afterEach(() => expect(errors).toEqual([]))

test('Magic Kingdom: duas abas, horários planejados, Buzz complementar e progresso independente', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('link', { name: 'Magic Kingdom', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /Checklist geral de preparação/ })).toBeVisible()
  await page.getByRole('link', { name: 'Magic Kingdom', exact: true }).click()
  await expect(page.getByRole('tab')).toHaveCount(2)
  await expect(page.getByText('No estacionamento', { exact: false }).first()).toContainText('07h30')
  await expect(page.getByText('Monorail na ida · balsa na volta', { exact: true })).toBeVisible()
  await expect(page.locator('.step-card')).toHaveCount(17)
  await expect(page.getByTestId('step-starlight').locator('.step-schedule')).toContainText('Aguardando divulgação do horário')
  await expect(page.getByTestId('step-starlight').locator('.step-schedule')).not.toContainText(/\d{2}h\d{2}/)
  await expect(page.locator('.step-card').filter({ hasText: 'Buzz Lightyear' })).toHaveCount(0)
  await expect(page.locator('.extras').getByText('Buzz Lightyear’s Space Ranger Spin', { exact: true })).toBeVisible()
  await page.getByTestId('step-big-thunder').getByRole('button', { name: 'Concluir Big Thunder Mountain Railroad', exact: true }).click()
  await page.getByTestId('step-tron-afternoon').getByRole('button', { name: /^Concluir / }).click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '13')
  await page.getByTestId('step-tron-night').getByRole('button', { name: /^Concluir / }).click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '13')
  await page.getByTestId('step-lunch-break').getByRole('button', { name: /^Concluir / }).click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '13')
  await page.reload()
  await expect(page.getByTestId('step-big-thunder')).toHaveClass(/status-completed/)
  await page.goto(islands)
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '0')
  await expect(page.locator('.step-card')).toHaveCount(11)
})

test('refeições do Magic: busca, filtros, preços sem invenção, link regional e persistência', async ({ page }) => {
  await page.goto(`${magic}/alimentacao`)
  await expect(page.locator('.food-card')).toHaveCount(7)
  await expect(page.locator('.food-price-note')).toContainText('01/11/2026')
  await expect(page.getByTestId('food-aloha-isle')).toContainText('A confirmar no cardápio oficial')
  await expect(page.getByRole('tabpanel').locator('.priority-badge')).toHaveCount(0)
  await page.getByRole('searchbox').fill('columbia')
  await expect(page.locator('.food-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'Limpar pesquisa de alimentação' }).click()
  await page.getByRole('button', { name: 'Doces', exact: true }).click()
  await expect(page.locator('.food-card')).toHaveCount(3)
  await expect(page.getByTestId('food-sleepy-hollow')).toBeVisible()
  await page.getByRole('button', { name: 'Todos', exact: true }).click()
  await page.getByLabel('Região do parque', { exact: true }).selectOption('liberty-square')
  await expect(page.locator('.food-card')).toHaveCount(3)
  await page.getByTestId('food-sleepy-hollow').getByRole('checkbox').check()
  await page.reload()
  await expect(page.getByTestId('food-sleepy-hollow').getByRole('checkbox')).toBeChecked()
  await page.getByRole('tab', { name: 'Atrações', exact: true }).click()
  await page.getByTestId('step-big-thunder').getByRole('link', { name: 'Ver opções de alimentação em Frontierland' }).click()
  await expect(page.getByLabel('Região do parque', { exact: true })).toHaveValue('frontierland')
  await expect(page.locator('.food-card')).toHaveCount(1)
  await page.goto(`${islands}/alimentacao`)
  await expect(page.locator('.food-card')).toHaveCount(5)
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0)
})

test('checklist global migra tarefas antigas, permite editar e não reaplica estado após reiniciar', async ({ page }) => {
  await page.goto(islands)
  await page.evaluate(storageKey => {
    const state = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    const legacy = state ?? { version: 1, parks: {} }
    delete legacy.globalChecklist
    legacy.preparation = { 'islands-of-adventure': { 'charge-phone': true, 'personal-old': true } }
    legacy.customTasks = { 'islands-of-adventure': [{ id: 'personal-old', name: 'Óculos antigos', description: 'Descrição original' }] }
    localStorage.setItem(storageKey, JSON.stringify(legacy))
  }, key)
  await page.goto('./#/preparacao')
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Carregar celulares.', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Óculos antigos', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Editar tarefa pessoal: Óculos antigos', exact: true }).click()
  await page.getByLabel('Editar tarefa', { exact: true }).fill('Óculos atualizados')
  await page.getByLabel('Descrição (opcional)', { exact: true }).fill('Nova descrição')
  await page.getByRole('button', { name: 'Salvar tarefa', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Óculos atualizados', exact: true })).toBeChecked()
  await page.goto(magic)
  await expect(page.getByRole('tab')).toHaveCount(2)
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Checklist', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Óculos atualizados', exact: true })).toBeChecked()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Roteiro', exact: true }).click()
  await expect(page.getByTestId('step-big-thunder')).toBeAttached()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Checklist', exact: true }).click()
  await page.getByRole('button', { name: 'Reiniciar checklist', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar checklist', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Carregar celulares.', exact: true })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Óculos atualizados', exact: true })).not.toBeChecked()
  await page.goto(`${islands}/preparacao`)
  await expect(page).toHaveURL(/#\/preparacao$/)
})

test('Magic e checklist geral funcionam offline, incluindo importação do novo backup', async ({ page, context }) => {
  await page.goto(magic)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect(page.locator('.connection')).toContainText('Pronto para usar offline', { timeout: 20000 })
  await page.reload()
  await context.setOffline(true)
  await page.getByTestId('step-tiana').getByRole('button', { name: /^Concluir / }).click()
  await page.goto('./#/preparacao')
  await page.getByRole('checkbox', { name: 'Conferir ingressos.', exact: true }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: 'Conferir ingressos.', exact: true })).toBeChecked()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('button', { name: 'Ferramentas', exact: true }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar roteiro e progresso' }).click()
  const path = await (await download).path()
  await page.locator('input[type=file]').setInputFiles(path!)
  await page.goto(magic)
  await page.reload()
  await expect(page.getByTestId('step-tiana')).toHaveClass(/status-completed/)
})

test('Magic e checklist geral: layouts responsivos', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const [name, path] of [['home', './'], ['magic', magic], ['magic-food', `${magic}/alimentacao`], ['global-checklist', './#/preparacao']]) {
      await page.goto(path)
      await page.evaluate(() => window.scrollTo(0, 0))
      await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
      if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/${name}-${width}.png`, fullPage: true })
      if (name === 'magic' && (width === 390 || width === 1440)) {
        await page.locator('.park-tabs').scrollIntoViewIfNeeded()
        await page.screenshot({ path: `test-results/magic-viewport-${width}.png` })
        await page.locator('.extras').scrollIntoViewIfNeeded()
        await page.screenshot({ path: `test-results/magic-extras-${width}.png` })
      }
    }
  }
})
