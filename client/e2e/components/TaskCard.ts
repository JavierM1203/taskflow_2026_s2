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

  getByTestId(testId: string): Locator {
    return this.card.getByTestId(testId);
  }

  locator(selector: string): Locator {
    return this.card.locator(selector);
  }

  async open(): Promise<void> {
    await this.getByTestId('task-card-title').click();
  }

  async changeStatus(status: string): Promise<void> {
    await this.getByTestId('task-card-status-select').selectOption(status);
  }
}
