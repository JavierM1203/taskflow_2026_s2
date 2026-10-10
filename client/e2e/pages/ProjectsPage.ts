import type { Locator, Page } from '@playwright/test';

export class ProjectsPage {
  constructor(private readonly page: Page) {}

  async createProject(name: string, description: string): Promise<void> {
    await this.page.getByTestId('project-name-input').fill(name);
    await this.page.getByTestId('project-description-input').fill(description);
    await this.page.getByTestId('project-create-submit').click();
  }

  projectCard(name: string): Locator {
    return this.page.getByTestId('project-card').filter({
      has: this.page.getByRole('link', { name, exact: true }),
    });
  }

  async openProject(name: string): Promise<void> {
    await this.projectCard(name).getByTestId('project-card-name').click();
  }
}
