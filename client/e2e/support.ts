import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import type { APIRequestContext, Browser, BrowserContext, Page } from '@playwright/test';
import { apiUrl, testPassword } from './fixtures';
import { LoginPage } from './pages/LoginPage';

export interface ApiUser {
  id: string;
  email: string;
  password: string;
  token: string;
}

export interface ApiProject {
  id: string;
  name: string;
}

export interface ApiTask {
  id: string;
  title: string;
}

function authHeaders(user: ApiUser): Record<string, string> {
  return { Authorization: `Bearer ${user.token}` };
}

export async function registerUser(request: APIRequestContext): Promise<ApiUser> {
  const email = `e2e-${randomUUID()}@test.com`;
  const response = await request.post(`${apiUrl}/auth/register`, {
    data: { email, password: testPassword },
  });
  expect(response.status()).toBe(201);

  const body: { token: string; user: { id: string } } = await response.json();
  return { id: body.user.id, email, password: testPassword, token: body.token };
}

export async function createProject(request: APIRequestContext, owner: ApiUser): Promise<ApiProject> {
  const response = await request.post(`${apiUrl}/projects`, {
    data: { name: `Proyecto E2E ${randomUUID()}` },
    headers: authHeaders(owner),
  });
  expect(response.status()).toBe(201);
  return response.json();
}

export async function createTask(
  request: APIRequestContext,
  user: ApiUser,
  projectId: string,
  title: string,
): Promise<ApiTask> {
  const response = await request.post(`${apiUrl}/projects/${projectId}/tasks`, {
    data: { title },
    headers: authHeaders(user),
  });
  expect(response.status()).toBe(201);
  return response.json();
}

export async function getTaskHistory(
  request: APIRequestContext,
  user: ApiUser,
  taskId: string,
): Promise<Array<{ changedBy: string; fromStatus: string | null; toStatus: string }>> {
  const response = await request.get(`${apiUrl}/tasks/${taskId}/history`, {
    headers: authHeaders(user),
  });
  expect(response.status()).toBe(200);
  return response.json();
}

/** Abre un navegador independiente (sin estado compartido) con la sesión del usuario iniciada. */
export async function openSession(
  browser: Browser,
  user: ApiUser,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  await expect(page).toHaveURL(/\/projects$/);
  return { context, page };
}
