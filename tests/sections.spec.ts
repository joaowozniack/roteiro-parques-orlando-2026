import { expect, test } from '@playwright/test'
import { parks } from '../src/data/parks'

const route = './#/parque/islands-of-adventure'
const storageKey = 'orlando-guide:/orlando-test/:progress:v1'
const chargePhone = 'Carregar celulares.'
const personalName = 'Levar óculos de sol'
let errors: string[] = []
test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-20T12:00:00Z')); errors = []; page.on('pageerror', error => errors.push(error.message)) })
test.afterEach(() => expect(errors).toEqual([]))

test('atualização preserva snapshot v1 e permite navegar pelo checklist geral e pelas duas abas', async ({ page }) => {
  const legacy = { version: 1, parks: Object.fromEntries(parks.map(park => [park.id, {
    order: park.steps.map(step => step.id),
    statuses: Object.fromEntries(park.steps.map(step => [step.id, step.id === 'velocicoaster' ? 'completed' : step.id === 'hagrids' ? 'later' : 'pending'])),
    priorities: Object.fromEntries(park.steps.map(step => [step.id, step.id === 'hulk' ? 'optional' : step.priority])),
  }])) }
  legacy.parks['islands-of-adventure'].order.reverse()
  await page.goto(route)
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: legacy })
  await page.reload()
  await expect(page.locator('.step-card').first()).toHaveAttribute('data-testid', 'step-dark-arts')
  await expect(page.getByTestId('step-velocicoaster')).toHaveClass(/status-completed/)
  await expect(page.getByTestId('step-hagrids')).toHaveClass(/status-later/)
  await expect(page.getByTestId('step-hulk').locator('.priority-badge')).toContainText('Opcional')
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Checklist Geral', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Checklist geral de preparação' })).toBeVisible()
  await expect(page.locator('.step-card')).toHaveCount(0)
  await expect(page.getByText('0 de 22 tarefas concluídas', { exact: true })).toBeVisible()
  await page.getByRole('checkbox', { name: chargePhone, exact: true }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: chargePhone, exact: true })).toBeChecked()
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)
  expect(saved.parks).toEqual(legacy.parks)
  expect(saved.globalChecklist.checked['charge-phone']).toBe(true)
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Parques', exact: true }).click()
  await page.locator('.featured-park').click()
  await expect(page.getByRole('tab', { name: 'Atrações', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('step-velocicoaster')).toHaveClass(/status-completed/)
  await expect(page.getByTestId('step-hulk').getByRole('combobox')).toHaveCount(0)
})

test('checklist: tarefas pessoais, recolher grupos, reiniciar com confirmação e desfazer', async ({ page }) => {
  await page.goto(`${route}/preparacao`)
  await page.getByRole('checkbox', { name: chargePhone, exact: true }).check()
  await page.getByLabel('Nova tarefa', { exact: true }).fill(personalName)
  await page.getByLabel('Descrição (opcional)', { exact: true }).fill('Guardar na mochila')
  await page.getByRole('button', { name: 'Adicionar tarefa', exact: true }).click()
  await page.getByRole('checkbox', { name: personalName, exact: true }).check()
  await expect(page.getByText('2 de 23 tarefas concluídas', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Excluir tarefa pessoal:/ })).toHaveCount(1)
  const group = page.locator('.preparation-group').filter({ has: page.getByRole('heading', { name: 'Documentos' }) })
  await group.locator('summary').click()
  await expect(group.getByRole('checkbox').first()).not.toBeVisible()
  await group.locator('summary').click()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: personalName, exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: chargePhone, exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Reiniciar checklist', exact: true }).click()
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(page.getByText('2 de 23 tarefas concluídas', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reiniciar checklist', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar checklist', exact: true }).click()
  await expect(page.getByText('0 de 23 tarefas concluídas', { exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: personalName, exact: true })).not.toBeChecked()
  await page.locator('.toast').getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: personalName, exact: true })).toBeChecked()
  await page.getByRole('button', { name: `Excluir tarefa pessoal: ${personalName}`, exact: true }).click()
  await expect(page.getByRole('checkbox', { name: personalName, exact: true })).toHaveCount(0)
  await page.locator('.toast').getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: personalName, exact: true })).toBeChecked()
})

test('alimentação: pesquisa sem acentos, filtros combinados, experimentados e link regional', async ({ page }) => {
  await page.goto(`${route}/alimentacao`)
  await expect(page.locator('.food-card')).toHaveCount(5)
  await expect(page.getByRole('tabpanel').locator('.priority-badge')).toHaveCount(0)
  await expect(page.getByText(/não preços confirmados para 30\/10\/2026/)).toBeVisible()
  await page.getByRole('searchbox', { name: 'Pesquisar alimentação por nome' }).fill('tres vassouras')
  await expect(page.locator('.food-card')).toHaveCount(1)
  await expect(page.getByTestId('food-three-broomsticks')).toBeVisible()
  await page.getByRole('button', { name: 'Limpar pesquisa de alimentação' }).click()
  await page.getByRole('button', { name: 'Restaurantes', exact: true }).click()
  await expect(page.locator('.food-card')).toHaveCount(2)
  await page.getByLabel('Região do parque', { exact: true }).selectOption('hogsmeade')
  await expect(page.locator('.food-card')).toHaveCount(1)
  await page.getByRole('searchbox').fill('inexistente')
  await expect(page.getByRole('heading', { name: 'Nenhuma opção encontrada' })).toBeVisible()
  await page.getByRole('button', { name: 'Limpar filtros de alimentação' }).click()
  await expect(page.locator('.food-card')).toHaveCount(5)
  await page.getByTestId('food-frozen-butterbeer').getByRole('checkbox').check()
  await page.reload()
  await expect(page.getByTestId('food-frozen-butterbeer').getByRole('checkbox')).toBeChecked()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Parques', exact: true }).click()
  await page.locator('.featured-park').click()
  await expect(page.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '0')
  await page.getByTestId('step-hagrids').getByRole('link', { name: 'Ver opções de alimentação em Hogsmeade' }).click()
  await expect(page.getByRole('tab', { name: 'Alimentação', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByLabel('Região do parque', { exact: true })).toHaveValue('hogsmeade')
  await expect(page.locator('.food-card')).toHaveCount(3)
})

test('backup restaura checklist e alimentação, e reiniciar preparação não afeta atrações ou alimentação', async ({ page }) => {
  await page.goto(route)
  await page.getByTestId('step-arrival').getByRole('button', { name: 'Concluir A aventura começa aqui', exact: true }).click()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Checklist Geral', exact: true }).click()
  await page.getByRole('checkbox', { name: chargePhone, exact: true }).check()
  await page.getByLabel('Nova tarefa', { exact: true }).fill(personalName)
  await page.getByRole('button', { name: 'Adicionar tarefa', exact: true }).click()
  await page.getByRole('checkbox', { name: personalName, exact: true }).check()
  await page.goto(`${route}/alimentacao`)
  await page.getByTestId('food-honeydukes').getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Abrir ferramentas da viagem', exact: true }).click()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar roteiro e progresso' }).click()
  const path = await (await downloaded).path()
  await page.getByRole('button', { name: 'Fechar ferramentas', exact: true }).click()
  await page.getByTestId('food-honeydukes').getByRole('checkbox').uncheck()
  await page.getByRole('button', { name: 'Abrir ferramentas da viagem', exact: true }).click()
  await page.locator('input[type=file]').setInputFiles(path!)
  await expect(page.getByTestId('food-honeydukes').getByRole('checkbox')).toBeChecked()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Checklist Geral', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: personalName, exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Reiniciar checklist', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar checklist', exact: true }).click()
  await page.goto(`${route}/alimentacao`)
  await expect(page.getByTestId('food-honeydukes').getByRole('checkbox')).toBeChecked()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Parques', exact: true }).click()
  await page.locator('.featured-park').click()
  await expect(page.getByTestId('step-arrival')).toHaveClass(/status-completed/)
})

test('novas abas funcionam offline e preservam marcações ao recarregar', async ({ page, context }) => {
  await page.goto(`${route}/preparacao`)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect(page.locator('.connection')).toContainText('Pronto para usar offline', { timeout: 20000 })
  await page.reload()
  await context.setOffline(true)
  await page.getByRole('checkbox', { name: chargePhone, exact: true }).check()
  await page.reload()
  await expect(page.getByRole('checkbox', { name: chargePhone, exact: true })).toBeChecked()
  await page.goto(`${route}/alimentacao`)
  await page.getByTestId('food-frozen-butterbeer').getByRole('checkbox').check()
  await page.reload()
  await expect(page.getByTestId('food-frozen-butterbeer').getByRole('checkbox')).toBeChecked()
  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link', { name: 'Parques', exact: true }).click()
  await page.locator('.featured-park').click()
  await expect(page.locator('.step-card')).toHaveCount(11)
})

test('preparação e alimentação sem transbordamento em celular, tablet e desktop', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const section of ['preparacao', 'alimentacao']) {
      await page.goto(section === 'preparacao' ? './#/preparacao' : `${route}/${section}`)
      await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: `test-results/${section}-${width}.png`, fullPage: true })
      if (width === 390) {
        if (section !== 'preparacao') {
          await page.locator('.park-tabs').scrollIntoViewIfNeeded()
          await page.evaluate(() => document.querySelector('.park-tabs')?.scrollIntoView({ block: 'start' }))
        }
        await page.screenshot({ path: `test-results/${section}-mobile.png` })
      }
    }
  }
})
