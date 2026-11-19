import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { MembersPage } from '../pages/MembersPage';
import { registerUser } from '../support';

test('el owner asigna una tarea a un miembro del proyecto (US-14)', async ({
  page,
  request,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const member = await registerUser(request);
  const membersPage = new MembersPage(page);
  await membersPage.gotoProject(testProject.id);
  await membersPage.addMember(member.email);
  await expect(membersPage.member(member.email)).toBeVisible();

  const taskTitle = `Tarea para asignar ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  await boardPage.openTask(taskTitle);

  await taskDetailPage.assignTo(member.email);
  await expect(page.getByTestId('task-assignee-select')).toHaveValue(member.id);

  await boardPage.gotoProject(testProject.id);
  await expect(boardPage.taskCard(taskTitle).getByTestId('task-card-assignee')).toHaveText(
    member.email,
  );
});

test('el owner desasigna una tarea que tenía un responsable (US-14)', async ({
  page,
  request,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const member = await registerUser(request);
  const membersPage = new MembersPage(page);
  await membersPage.gotoProject(testProject.id);
  await membersPage.addMember(member.email);
  await expect(membersPage.member(member.email)).toBeVisible();

  const taskTitle = `Tarea para desasignar ${Date.now()}`;
  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  await boardPage.openTask(taskTitle);
  await taskDetailPage.assignTo(member.email);
  await expect(page.getByTestId('task-assignee-select')).toHaveValue(member.id);

  await taskDetailPage.assignTo('Sin asignar');
  await expect(page.getByTestId('task-assignee-select')).toHaveValue('');

  await boardPage.gotoProject(testProject.id);
  await expect(boardPage.taskCard(taskTitle).getByTestId('task-card-assignee')).toHaveText(
    'Sin asignar',
  );
});
