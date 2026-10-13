import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('la sesión sobrevive a recargar la página y a entrar por un enlace directo (US-02)', async ({
  page,
  testUser,
  testProject,
}) => {
  await page.reload();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByTestId('header-user-email')).toHaveText(testUser.email);

  await page.goto(`/projects/${testProject.id}`);
  await expect(page.getByTestId('board-project-name')).toHaveText(testProject.name);
});

test('después de salir, las rutas protegidas vuelven a pedir login', async ({
  page,
  testUser,
  testProject,
}) => {
  await page.goto(`/projects/${testProject.id}`);
  await expect(page.getByTestId('board-page')).toBeVisible();

  await page.getByTestId('logout-button').click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('app-header')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('taskflow_token'))).toBeNull();

  await page.goto(`/projects/${testProject.id}`);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('board-page')).toHaveCount(0);

  await page.goBack();
  await expect(page.getByTestId('board-page')).toHaveCount(0);
  await expect(page.getByText(testUser.email)).toHaveCount(0);
});

test('un token inválido guardado en el navegador manda al login', async ({ page, testUser }) => {
  expect(testUser.token).not.toBe('');
  await page.evaluate(() => localStorage.setItem('taskflow_token', 'token-invalido'));

  await page.goto('/projects');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});
