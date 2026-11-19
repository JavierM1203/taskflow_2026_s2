import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByTestId('login-email-input').fill(email);
    await this.page.getByTestId('login-password-input').fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async register(email: string, password: string, name: string): Promise<void> {
    await this.page.getByTestId('login-mode-toggle').click();
    await this.page.getByTestId('login-name-input').fill(name);
    await this.page.getByTestId('login-email-input').fill(email);
    await this.page.getByTestId('login-password-input').fill(password);
    await this.page.getByTestId('login-submit').click();
  }
}
