import type { Locator, Page } from '@playwright/test';

export class TaskDetailPage {
  constructor(private readonly page: Page) {}

  async goto(projectId: string, taskId: string): Promise<void> {
    await this.page.goto(`/projects/${projectId}/tasks/${taskId}`);
  }

  async assignTo(label: string): Promise<void> {
    await this.page.getByTestId('task-assignee-select').selectOption({ label });
    await this.save();
  }

  async setDueDate(date: string): Promise<void> {
    await this.page.getByTestId('task-duedate-input').fill(date);
    await this.save();
  }

  async save(): Promise<void> {
    await this.page.getByTestId('task-save-button').click();
  }

  async addComment(body: string): Promise<void> {
    await this.page.getByTestId('comment-add-input').fill(body);
    await this.page.getByTestId('comment-add-button').click();
  }

  comment(body: string): Locator {
    return this.page.getByTestId('comment-item').filter({
      has: this.page.getByText(body, { exact: true }),
    });
  }
}
