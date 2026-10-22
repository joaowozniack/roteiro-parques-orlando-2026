import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-21T12:00:00Z')) })

test('tema claro persiste, funciona offline e não altera o progresso', async ({ page, context }) => {
  await page.goto('./#/parque/islands-of-adventure')
  await page.getByTestId('step-velocicoaster').getByRole('button', { name: /^Concluir / }).click()
  await page.getByRole('button', { name: 'Ativar modo claro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('meta[name=theme-color]')).toHaveAttribute('content', '#f3f6fa')
  await expect(page.getByTestId('step-velocicoaster')).toHaveClass(/status-completed/)
  await expect(page.getByTestId('step-velocicoaster')).toHaveCSS('background-color', 'rgb(237, 248, 241)')
  await expect(page.getByTestId('step-hagrids')).toHaveCSS('border-left-color', 'rgb(189, 69, 73)')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Ativar modo escuro' })).toBeVisible()
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect(page.locator('.connection')).toContainText('Pronto para usar offline', { timeout: 20000 })
  await page.reload()
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByTestId('step-velocicoaster')).toHaveClass(/status-completed/)
  await page.getByRole('button', { name: 'Ativar modo escuro' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByTestId('step-velocicoaster')).toHaveClass(/status-completed/)
})

test('modo claro em todas as seções e tamanhos; diálogo e avisos legíveis', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Ativar modo claro' }).click()
  const paths = ['./', './#/preparacao', './#/parque/islands-of-adventure', './#/parque/magic-kingdom', './#/parque/universal-studios', './#/parque/epic-universe', './#/parque/epic-universe/alimentacao']
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const [index, path] of paths.entries()) {
      await page.goto(path)
      await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width)
      await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(243, 246, 250)')
      if (width === 390 || width === 1440) {
        if (index === 5) await page.locator('.day-strategy').scrollIntoViewIfNeeded()
        else if (index === 6) await page.locator('.food-card').first().scrollIntoViewIfNeeded()
        else await page.evaluate(() => window.scrollTo(0, 0))
        await page.screenshot({ path: `test-results/light-${index}-${width}.png` })
      }
    }
  }
  await page.getByRole('button', { name: 'Abrir ferramentas da viagem' }).click()
  await expect(page.locator('.tools-dialog')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.screenshot({ path: 'test-results/light-tools.png' })
  await page.getByRole('button', { name: 'Fechar ferramentas', exact: true }).click()
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('./#/parque/epic-universe')
  await page.getByTestId('step-battle-ministry').getByRole('button', { name: /^Expandir detalhes/ }).click()
  await page.getByTestId('step-battle-ministry').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/light-details.png' })
})
