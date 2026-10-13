import { expect } from '@playwright/test';
import { test } from '../fixtures';

const timezones = [
  { label: 'UTC-3', timezoneId: 'America/Montevideo' },
  { label: 'UTC+14', timezoneId: 'Pacific/Kiritimati' },
  { label: 'UTC-11', timezoneId: 'Pacific/Pago_Pago' },
];

for (const { label, timezoneId } of timezones) {
  test.describe(`cliente en ${label}`, () => {
    test.use({ timezoneId });

    test(`la fecha de vencimiento se muestra igual a la cargada (US-16) [${label}]`, async ({
      page,
      testProject,
      boardPage,
      taskDetailPage,
    }) => {
      const taskTitle = `Tarea con vencimiento ${Date.now()}`;
      await boardPage.gotoProject(testProject.id);

      await boardPage.createTaskWithDueDate(taskTitle, '2026-09-15');
      const taskCard = boardPage.taskCard(taskTitle);
      await expect(taskCard.getByTestId('task-card-duedate')).toHaveText('2026-09-15');

      await boardPage.openTask(taskTitle);
      await expect(page.getByTestId('task-duedate-value')).toHaveText('2026-09-15');
      await expect(page.getByTestId('task-duedate-input')).toHaveValue('2026-09-15');

      await taskDetailPage.setDueDate('2026-12-31');
      await expect(page.getByTestId('task-duedate-value')).toHaveText('2026-12-31');

      await page.reload();
      await expect(page.getByTestId('task-duedate-value')).toHaveText('2026-12-31');
      await expect(page.getByTestId('task-duedate-input')).toHaveValue('2026-12-31');
    });
  });
}
