import type { Locator, Page } from '@playwright/test';

export class TaskDetailPage {
  constructor(private readonly page: Page) {}

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
