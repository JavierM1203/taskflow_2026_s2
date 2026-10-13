import type { Locator, Page } from '@playwright/test';

export class BoardPage {
  constructor(private readonly page: Page) {}

  async gotoProject(projectId: string): Promise<void> {
    await this.page.goto(`/projects/${projectId}`);
  }

  async createTask(title: string, priority = 'MEDIUM'): Promise<void> {
    await this.page.getByTestId('task-create-title-input').fill(title);
    await this.page.getByTestId('task-create-priority-select').selectOption(priority);
    await this.page.getByTestId('task-create-submit').click();
  }

  async createTaskWithDueDate(title: string, dueDate: string): Promise<void> {
    await this.page.getByTestId('task-create-title-input').fill(title);
    await this.page.getByTestId('task-create-duedate-input').fill(dueDate);
    await this.page.getByTestId('task-create-submit').click();
  }

  column(status: string): Locator {
    return this.page.getByTestId(`board-column-list-${status}`);
  }

  taskCard(title: string): Locator {
    return this.page.getByTestId('task-card').filter({
      has: this.page.getByRole('link', { name: title, exact: true }),
    });
  }

  async changeTaskStatus(title: string, status: string): Promise<void> {
    await this.taskCard(title).getByTestId('task-card-status-select').selectOption(status);
  }

  async openTask(title: string): Promise<void> {
    await this.taskCard(title).getByTestId('task-card-title').click();
  }
}
