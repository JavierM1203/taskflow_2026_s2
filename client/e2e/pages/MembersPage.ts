import type { Locator, Page } from '@playwright/test';

export class MembersPage {
  constructor(private readonly page: Page) {}

  async gotoProject(projectId: string): Promise<void> {
    await this.page.goto(`/projects/${projectId}/members`);
  }

  async addMember(email: string): Promise<void> {
    await this.page.getByTestId('member-email-input').fill(email);
    await this.page.getByTestId('member-add-button').click();
  }

  member(email: string): Locator {
    return this.page.getByTestId('member-item').filter({
      has: this.page.getByText(email, { exact: true }),
    });
  }

  async removeMember(email: string): Promise<void> {
    await this.member(email).getByTestId('member-remove-button').click();
  }
}
