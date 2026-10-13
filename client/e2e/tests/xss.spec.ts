import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('el HTML en títulos y comentarios se muestra como texto y no se ejecuta', async ({
  page,
  testProject,
  boardPage,
  taskDetailPage,
}) => {
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });

  const taskTitle = `<img src=x onerror="window.__xss=1;alert(1)"> ${Date.now()}`;
  const comment = '<script>window.__xss=1</script><b onmouseover="alert(1)">negrita</b>';

  await boardPage.gotoProject(testProject.id);
  await boardPage.createTask(taskTitle);
  const taskCard = boardPage.taskCard(taskTitle);
  await expect(taskCard.getByTestId('task-card-title')).toHaveText(taskTitle);
  await expect(taskCard.locator('img')).toHaveCount(0);

  await boardPage.openTask(taskTitle);
  await expect(page.getByTestId('task-title-input')).toHaveValue(taskTitle);
  await taskDetailPage.addComment(comment);
  const commentBody = taskDetailPage.comment(comment).getByTestId('comment-item-body');
  await expect(commentBody).toHaveText(comment);
  await expect(commentBody.locator('b, script')).toHaveCount(0);

  await page.reload();
  await expect(taskDetailPage.comment(comment)).toBeVisible();

  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  expect(dialogs).toEqual([]);
});
