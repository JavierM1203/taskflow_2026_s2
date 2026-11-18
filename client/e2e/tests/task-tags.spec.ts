import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('guarda las etiquetas en minúsculas (US-15)', async ({
  page,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const taskTitle = `Tarea con etiqueta ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  await boardPage.openTask(taskTitle);

  await taskDetailPage.addTag('Urgente');

  await expect(taskDetailPage.tag('urgente')).toBeVisible();
  await expect(page.getByTestId('tag-chip-name')).toHaveText('urgente');
});

test('no permite agregar la misma etiqueta dos veces a una tarea (US-15)', async ({
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const taskTitle = `Tarea con etiqueta repetida ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  await boardPage.openTask(taskTitle);

  await taskDetailPage.addTag('bug');
  await taskDetailPage.addTag('bug');

  await expect(taskDetailPage.tags()).toHaveCount(1);
});

test('rechaza agregar una etiqueta número 11 a una tarea (US-15)', async ({
  page,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const taskTitle = `Tarea con muchas etiquetas ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  await boardPage.openTask(taskTitle);

  for (let i = 1; i <= 10; i += 1) {
    await taskDetailPage.addTag(`tag-${i}`);
  }
  await expect(taskDetailPage.tags()).toHaveCount(10);

  await taskDetailPage.addTag('tag-11');

  await expect(page.getByTestId('error-message')).toBeVisible();
  await expect(taskDetailPage.tags()).toHaveCount(10);
});
