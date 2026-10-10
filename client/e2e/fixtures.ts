import { randomUUID } from 'node:crypto';
import { expect, test as base } from '@playwright/test';
import { BoardPage } from './pages/BoardPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TaskDetailPage } from './pages/TaskDetailPage';

interface TestUser {
  email: string;
  password: string;
  token: string;
}

interface TestProject {
  id: string;
  name: string;
}

interface Fixtures {
  loginPage: LoginPage;
  projectsPage: ProjectsPage;
  boardPage: BoardPage;
  taskDetailPage: TaskDetailPage;
  testUser: TestUser;
  testProject: TestProject;
}

const apiUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:3000/api';
const testPassword = 'Password1';

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },

  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },

  taskDetailPage: async ({ page }, use) => {
    await use(new TaskDetailPage(page));
  },

  testUser: async ({ request, page, loginPage }, use) => {
    const email = `e2e-${randomUUID()}@test.com`;
    const response = await request.post(`${apiUrl}/auth/register`, {
      data: { email, password: testPassword },
    });
    expect(response.status()).toBe(201);

    const body: { token: string } = await response.json();
    await loginPage.goto();
    await loginPage.login(email, testPassword);
    await expect(page).toHaveURL(/\/projects$/);

    await use({ email, password: testPassword, token: body.token });
  },

  testProject: async ({ request, testUser }, use) => {
    const name = `Proyecto E2E ${randomUUID()}`;
    const response = await request.post(`${apiUrl}/projects`, {
      data: { name },
      headers: { Authorization: `Bearer ${testUser.token}` },
    });
    expect(response.status()).toBe(201);

    const project: TestProject = await response.json();
    await use(project);
  },
});
