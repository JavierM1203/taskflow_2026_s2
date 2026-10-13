import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('TODO → DONE se rechaza y el tablero sigue mostrando la tarea en TODO (US-06)', async ({
  page,
  testProject,
  boardPage,
}) => {
  const taskTitle = `Tarea sin saltos ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  const taskCard = boardPage.taskCard(taskTitle);
  await expect(taskCard).toBeVisible();

  await boardPage.changeTaskStatus(taskTitle, 'DONE');

  await expect(page.getByTestId('error-message')).toBeVisible();
  await expect(taskCard.getByTestId('task-card-status-select')).toHaveValue('TODO');
  await expect(boardPage.column('TODO').getByText(taskTitle, { exact: true })).toBeVisible();

  await page.reload();
  await expect(boardPage.column('TODO').getByText(taskTitle, { exact: true })).toBeVisible();
  await expect(boardPage.column('DONE').getByText(taskTitle, { exact: true })).toHaveCount(0);
});

test('una tarea DONE no se puede reabrir desde el tablero ni desde el detalle (US-06)', async ({
  page,
  testProject,
  boardPage,
}) => {
  const taskTitle = `Tarea terminada ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  const taskCard = boardPage.taskCard(taskTitle);

  await boardPage.changeTaskStatus(taskTitle, 'IN_PROGRESS');
  await expect(taskCard.getByTestId('task-card-status-select')).toHaveValue('IN_PROGRESS');
  await boardPage.changeTaskStatus(taskTitle, 'DONE');
  await expect(taskCard.getByTestId('task-card-status-select')).toHaveValue('DONE');

  await boardPage.changeTaskStatus(taskTitle, 'TODO');
  await expect(page.getByTestId('error-message')).toBeVisible();
  await expect(taskCard.getByTestId('task-card-status-select')).toHaveValue('DONE');

  await boardPage.openTask(taskTitle);
  await expect(page.getByTestId('task-current-status')).toHaveText('DONE');
  await page.getByTestId('task-status-select').selectOption('IN_PROGRESS');
  await page.getByTestId('task-status-submit').click();
  await expect(page.getByTestId('error-message')).toBeVisible();
  await expect(page.getByTestId('task-current-status')).toHaveText('DONE');

  await page.reload();
  await expect(page.getByTestId('task-current-status')).toHaveText('DONE');
});
