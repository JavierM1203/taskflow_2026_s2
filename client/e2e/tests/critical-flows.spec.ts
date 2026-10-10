import { expect } from '@playwright/test';
import { test } from '../fixtures';

function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;
}

test('permite registrarse y crear un proyecto', async ({ page, loginPage, projectsPage }) => {
  const email = uniqueEmail();
  const projectName = `Proyecto nuevo ${Date.now()}`;

  await loginPage.goto();
  await loginPage.register(email, 'Password1', 'Usuario E2E');

  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByTestId('header-user-email')).toHaveText(email);

  await projectsPage.createProject(projectName, 'Proyecto creado desde Playwright');
  const project = projectsPage.projectCard(projectName);
  await expect(project).toBeVisible();
  await expect(project.getByTestId('project-card-description')).toHaveText(
    'Proyecto creado desde Playwright',
  );
});

test('requiere autenticación y muestra error con credenciales inválidas', async ({
  page,
  loginPage,
}) => {
  await page.goto('/projects');
  await expect(page).toHaveURL(/\/login$/);

  await loginPage.login(uniqueEmail(), 'Password1');
  await expect(page.getByText('Invalid credentials')).toBeVisible();
});

test('permite crear una tarea, moverla de estado y comentarla', async ({
  page,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const taskTitle = `Tarea E2E ${Date.now()}`;
  const comment = 'Comentario de prueba E2E';
  await boardPage.gotoProject(testProject.id);

  await boardPage.createTask(taskTitle, 'HIGH');
  const taskCard = boardPage.taskCard(taskTitle);
  await expect(taskCard).toBeVisible();
  await expect(taskCard.getByTestId('task-card-priority')).toHaveText('HIGH');

  await boardPage.changeTaskStatus(taskTitle, 'IN_PROGRESS');
  await expect(taskCard.getByTestId('task-card-status-select')).toHaveValue('IN_PROGRESS');

  await boardPage.openTask(taskTitle);
  await expect(page.getByTestId('task-detail-page')).toBeVisible();
  await taskDetailPage.addComment(comment);
  await expect(taskDetailPage.comment(comment)).toBeVisible();
  await expect(page.getByTestId('history-list')).toContainText('TODO → IN_PROGRESS');
});
