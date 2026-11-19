import type { Locator, Page } from '@playwright/test';
import { TaskCard } from '../components/TaskCard';

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

  taskCard(title: string): TaskCard {
    const card = this.page.getByTestId('task-card').filter({
      has: this.page.getByRole('link', { name: title, exact: true }),
    });
    return new TaskCard(card);
  }

  async changeTaskStatus(title: string, status: string): Promise<void> {
    await this.taskCard(title).changeStatus(status);
  }

  async openTask(title: string): Promise<void> {
    await this.taskCard(title).open();
  }
}
