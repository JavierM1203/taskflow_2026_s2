import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { createProject, createTask, registerUser } from '../support';
import { apiUrl } from '../fixtures';

test('permite editar título, descripción y prioridad de una tarea (US-12)', async ({
  page,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const taskTitle = `Tarea editable ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  await boardPage.openTask(taskTitle);

  const newTitle = `${taskTitle} (editada)`;
  await taskDetailPage.setTitle(newTitle);
  await taskDetailPage.setDescription('Descripción actualizada desde el detalle');
  await taskDetailPage.setPriority('HIGH');
  await taskDetailPage.save();

  await expect(page.getByTestId('task-title-input')).toHaveValue(newTitle);
  await expect(page.getByTestId('error-message')).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId('task-title-input')).toHaveValue(newTitle);
  await expect(page.getByTestId('task-description-input')).toHaveValue(
    'Descripción actualizada desde el detalle',
  );
  await expect(page.getByTestId('task-priority-select')).toHaveValue('HIGH');
});

test('rechaza un título de menos de 3 caracteres al editar (US-12)', async ({
  page,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const taskTitle = `Tarea con título corto ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  await boardPage.openTask(taskTitle);

  await taskDetailPage.setTitle('ab');
  await taskDetailPage.save();

  await expect(page.getByTestId('error-message')).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('task-title-input')).toHaveValue(taskTitle);
});

test('un usuario que no es miembro del proyecto no puede editar la tarea (US-12)', async ({
  request,
}) => {
  const owner = await registerUser(request);
  const nonMember = await registerUser(request);
  const project = await createProject(request, owner);
  const task = await createTask(request, owner, project.id, 'Tarea protegida de edición');

  const res = await request.patch(`${apiUrl}/tasks/${task.id}`, {
    data: { title: 'editado por un no miembro' },
    headers: { Authorization: `Bearer ${nonMember.token}` },
  });

  expect(res.status()).toBe(403);

  const stillThere = await request.get(`${apiUrl}/tasks/${task.id}`, {
    headers: { Authorization: `Bearer ${owner.token}` },
  });
  expect(stillThere.status()).toBe(200);
  expect((await stillThere.json()).title).toBe('Tarea protegida de edición');
});
