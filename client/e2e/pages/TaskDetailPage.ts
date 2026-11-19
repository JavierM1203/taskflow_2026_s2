import { expect, type Locator, type Page } from '@playwright/test';

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

  async setTitle(title: string): Promise<void> {
    await this.page.getByTestId('task-title-input').fill(title);
  }

  async setDescription(description: string): Promise<void> {
    await this.page.getByTestId('task-description-input').fill(description);
  }

  async setPriority(priority: string): Promise<void> {
    await this.page.getByTestId('task-priority-select').selectOption(priority);
  }

  async save(): Promise<void> {
    const button = this.page.getByTestId('task-save-button');
    await button.click();
    // El botón queda disabled mientras el guardado está en vuelo; esperar a que
    // vuelva a habilitarse evita que una segunda acción pise un guardado anterior.
    await expect(button).toBeEnabled();
  }

  async addTag(name: string): Promise<void> {
    await this.page.getByTestId('tag-add-input').fill(name);
    // El botón no se deshabilita durante el request: si se llama addTag varias
    // veces en fila (p. ej. para llegar al límite de etiquetas) hay que esperar
    // la respuesta real de cada POST, no solo el click, para no mandarlas en paralelo.
    const response = this.page.waitForResponse(
      (res) => res.request().method() === 'POST' && /\/tasks\/[^/]+\/tags$/.test(res.url()),
    );
    await this.page.getByTestId('tag-add-button').click();
    await response;
  }

  tags(): Locator {
    return this.page.getByTestId('tag-chip');
  }

  tag(name: string): Locator {
    return this.page.getByTestId('tag-chip').filter({
      has: this.page.getByTestId('tag-chip-name').getByText(name, { exact: true }),
    });
  }

  async removeTag(name: string): Promise<void> {
    await this.tag(name).getByTestId('tag-remove-button').click();
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
