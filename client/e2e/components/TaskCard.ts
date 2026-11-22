import type { Locator } from '@playwright/test';

/**
 * Component Object para una tarjeta de tarea dentro del tablero (BoardPage).
 * Encapsula los testids de la tarjeta para que BoardPage no tenga que
 * conocerlos ni repetirlos en cada acción.
 */
export class TaskCard {
  constructor(private readonly card: Locator) {}

  /** Locator raíz de la tarjeta, para aserciones genéricas (toBeVisible, etc). */
  get root(): Locator {
    return this.card;
  }

  title(): Locator {
    return this.card.getByTestId('task-card-title');
  }

  priority(): Locator {
    return this.card.getByTestId('task-card-priority');
  }

  status(): Locator {
    return this.card.getByTestId('task-card-status-select');
  }

  assignee(): Locator {
    return this.card.getByTestId('task-card-assignee');
  }

  dueDate(): Locator {
    return this.card.getByTestId('task-card-duedate');
  }

  /** Imágenes dentro de la tarjeta; debe ser 0 siempre (chequeo de XSS almacenado). */
  images(): Locator {
    return this.card.locator('img');
  }

  async open(): Promise<void> {
    await this.title().click();
  }

  async changeStatus(status: string): Promise<void> {
    await this.status().selectOption(status);
  }
}
