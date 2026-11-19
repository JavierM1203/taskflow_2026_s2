import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { BoardPage } from '../pages/BoardPage';
import { MembersPage } from '../pages/MembersPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { createProject, createTask, getTaskHistory, openSession, registerUser } from '../support';

test('un miembro agregado ve el proyecto y deja de verlo cuando el owner lo quita (US-11, US-04)', async ({
  browser,
  request,
}) => {
  const owner = await registerUser(request);
  const member = await registerUser(request);
  const project = await createProject(request, owner);

  const ownerSession = await openSession(browser, owner);
  const memberSession = await openSession(browser, member);
  const ownerMembers = new MembersPage(ownerSession.page);
  const memberProjects = new ProjectsPage(memberSession.page);

  await expect(memberSession.page.getByTestId('project-list')).toBeAttached();
  await expect(memberProjects.projectCard(project.name)).toHaveCount(0);

  await ownerMembers.gotoProject(project.id);
  await ownerMembers.addMember(member.email);
  await expect(ownerMembers.member(member.email)).toBeVisible();

  await memberSession.page.reload();
  await expect(memberProjects.projectCard(project.name)).toBeVisible();
  await memberProjects.openProject(project.name);
  await expect(memberSession.page.getByTestId('board-project-name')).toHaveText(project.name);

  await ownerMembers.removeMember(member.email);
  await expect(ownerMembers.member(member.email)).toHaveCount(0);

  await memberSession.page.reload();
  await expect(memberSession.page.getByTestId('error-message')).toBeVisible();
  await expect(memberSession.page.getByTestId('board-page')).toHaveCount(0);

  await memberSession.page.goto('/projects');
  await expect(memberSession.page.getByTestId('project-list')).toBeAttached();
  await expect(memberProjects.projectCard(project.name)).toHaveCount(0);

  await ownerSession.context.close();
  await memberSession.context.close();
});

test('el owner ve a los miembros del proyecto al entrar desde otro navegador (US-11)', async ({
  browser,
  request,
}) => {
  const owner = await registerUser(request);
  const member = await registerUser(request);
  const project = await createProject(request, owner);

  const firstSession = await openSession(browser, owner);
  const firstMembers = new MembersPage(firstSession.page);
  await firstMembers.gotoProject(project.id);
  await firstMembers.addMember(member.email);
  await expect(firstMembers.member(member.email)).toBeVisible();
  await firstSession.context.close();

  const secondSession = await openSession(browser, owner);
  const secondMembers = new MembersPage(secondSession.page);
  await secondMembers.gotoProject(project.id);
  await expect(secondSession.page.getByTestId('members-page')).toBeVisible();
  await expect(secondMembers.member(member.email)).toBeVisible();
  await expect(secondMembers.member(member.email).getByTestId('member-remove-button')).toBeVisible();

  await secondSession.context.close();
});

test('el owner asigna una tarea, el asignado la avanza y al quitarlo queda sin asignado (US-14, US-06, US-11)', async ({
  browser,
  request,
}) => {
  const owner = await registerUser(request);
  const member = await registerUser(request);
  const project = await createProject(request, owner);
  const taskTitle = `Tarea asignable ${Date.now()}`;
  const task = await createTask(request, owner, project.id, taskTitle);

  const ownerSession = await openSession(browser, owner);
  const ownerMembers = new MembersPage(ownerSession.page);
  const ownerBoard = new BoardPage(ownerSession.page);
  const ownerTask = new TaskDetailPage(ownerSession.page);

  await ownerMembers.gotoProject(project.id);
  await ownerMembers.addMember(member.email);
  await expect(ownerMembers.member(member.email)).toBeVisible();

  await ownerTask.goto(project.id, task.id);
  await expect(ownerSession.page.getByTestId('task-detail-page')).toBeVisible();
  await ownerTask.assignTo(member.email);
  await expect(ownerSession.page.getByTestId('task-assignee-select')).toHaveValue(member.id);
  await expect(ownerSession.page.getByTestId('task-current-status')).toHaveText('TODO');

  await ownerBoard.gotoProject(project.id);
  await expect(ownerBoard.taskCard(taskTitle).getByTestId('task-card-assignee')).toHaveText(
    member.email,
  );

  const memberSession = await openSession(browser, member);
  const memberBoard = new BoardPage(memberSession.page);
  await memberBoard.gotoProject(project.id);
  await expect(memberBoard.taskCard(taskTitle).getByTestId('task-card-assignee')).toHaveText(
    member.email,
  );
  await memberBoard.changeTaskStatus(taskTitle, 'IN_PROGRESS');
  await expect(memberBoard.column('IN_PROGRESS').getByText(taskTitle, { exact: true })).toBeVisible();

  await ownerTask.goto(project.id, task.id);
  await expect(ownerSession.page.getByTestId('task-current-status')).toHaveText('IN_PROGRESS');
  await expect(ownerSession.page.getByTestId('history-list')).toContainText('TODO → IN_PROGRESS');
  const history = await getTaskHistory(request, owner, task.id);
  expect(history.find((entry) => entry.toStatus === 'IN_PROGRESS')?.changedBy).toBe(member.id);

  await ownerMembers.gotoProject(project.id);
  await ownerMembers.removeMember(member.email);
  await expect(ownerMembers.member(member.email)).toHaveCount(0);

  await ownerBoard.gotoProject(project.id);
  await expect
    .soft(ownerBoard.taskCard(taskTitle).getByTestId('task-card-assignee'))
    .toHaveText('Sin asignar');

  await memberSession.page.reload();
  await expect(memberSession.page.getByTestId('board-page')).toHaveCount(0);

  await ownerSession.context.close();
  await memberSession.context.close();
});
