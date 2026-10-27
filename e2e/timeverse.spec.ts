import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing is usable, responsive and has a working interactive preview', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Every moment has a story/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The next chapter.' })).toBeVisible();
  await page.getByRole('button', { name: 'Looking back', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hello, university.' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore the little things' }).click();
  await expect(page).toHaveURL(/#features/);
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('complete event CRUD, persistence, validation, filtering and demo cleanup', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /Make a little room/ })).toBeVisible();
  await page.getByRole('link', { name: 'Add your first moment' }).click();
  await page.getByRole('button', { name: 'Save this moment' }).click();
  await expect(page.getByText('Give your moment a name.')).toBeVisible();
  await page.getByLabel('Name your moment').fill('My future adventure');
  await page.getByLabel('A little story').fill('A trip to remember.');
  await page.getByLabel('The date', { exact: false }).fill('2030-06-18');
  await page.getByLabel('Category', { exact: true }).selectOption('travel');
  await page.getByRole('button', { name: 'Choose 🌴 icon' }).click();
  await page.getByLabel('Ocean', { exact: true }).check();
  await page.getByRole('button', { name: 'Save this moment' }).click();
  await expect(page).toHaveURL(/\/events\/[a-f0-9-]+$/);
  await expect(
    page.getByRole('heading', { name: 'My future adventure', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('TIME REMAINING', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('A trip to remember.')).toBeVisible();
  await page.getByRole('link', { name: 'Edit moment', exact: true }).click();
  await page.getByLabel('Name your moment').fill('The day it all began');
  await page.getByLabel('The date', { exact: false }).fill('2020-01-01');
  await page.getByLabel('The exact moment', { exact: false }).check();
  await page.getByLabel('The time', { exact: false }).fill('10:30');
  await page.getByLabel('Timezone', { exact: true }).fill('Europe/London');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('heading', { name: 'The day it all began', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('TIME SINCE', { exact: true })).toBeVisible();
  await expect(page.getByText('Europe/London', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to your moments', exact: true }).click();
  await page.getByRole('tab', { name: 'Memories', exact: true }).click();
  await expect(
    page.locator('.event-card').getByRole('heading', { name: 'The day it all began' }),
  ).toBeVisible();
  await page.getByLabel('Search moments').fill('no such event');
  await expect(page.getByRole('heading', { name: 'No moments found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Filter by category').selectOption('birthday');
  await expect(page.getByRole('heading', { name: 'No moments found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Sort moments').selectOption('oldest');
  await page.locator('.event-card').getByRole('heading', { name: 'The day it all began' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Delete moment', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Make a little room/ })).toBeVisible();
  await page.getByRole('button', { name: 'Try demo events' }).click();
  await expect(page.locator('.event-card')).toHaveCount(4);
  await page.getByRole('tab', { name: 'Upcoming', exact: true }).click();
  await expect(page.locator('.event-card')).toHaveCount(2);
  await page.getByLabel('Sort moments').selectOption('nearest');
  await expect(page.locator('.event-card').first()).toContainText('A little escape');
  await page.getByLabel('Sort moments').selectOption('farthest');
  await expect(page.locator('.event-card').first()).toContainText('The next chapter');
  await page.getByRole('tab', { name: 'Memories', exact: true }).click();
  await expect(page.locator('.event-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Clear demo events', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear demo events' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Make a little room/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('date-only Today and automatic exact transition use the shared live clock', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-27T06:29:58Z'));
  await page.goto('/dashboard');
  await page.evaluate(() => {
    const base = {
      description: '',
      category: 'personal',
      emoji: '✨',
      accentColor: '#8b7bec',
      date: '2026-10-27',
      timezone: 'Asia/Colombo',
      createdAt: '2026-10-27T00:00:00.000Z',
      updatedAt: '2026-10-27T00:00:00.000Z',
    };
    localStorage.setItem(
      'timeverse:events:v1',
      JSON.stringify([
        {
          ...base,
          id: 'exact-event',
          title: 'An exact moment',
          dateMode: 'date-time',
          time: '12:00',
        },
        { ...base, id: 'today-event', title: 'A whole day', dateMode: 'date-only' },
      ]),
    );
  });
  await page.reload();
  await page.goto('/events/exact-event');
  await expect(page.getByText('TIME REMAINING', { exact: true })).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-10-27T06:30:00Z'));
  await expect(page.getByText('The Moment Is Here.', { exact: true })).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-10-27T06:30:02Z'));
  await expect(page.getByText('TIME SINCE', { exact: true })).toBeVisible();
  await page.goto('/events/today-event');
  await expect(page.getByText('Today is the day.', { exact: true })).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-10-27T18:30:00Z'));
  await expect(page.getByText('TIME SINCE', { exact: true })).toBeVisible();
});

test('keyboard dialog flow, card menu, malformed storage, and 320px layout', async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => localStorage.setItem('timeverse:events:v1', 'broken JSON'));
  await page.reload();
  await expect(
    page.getByRole('status').filter({ hasText: 'Saved data could not be read' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Try demo events' }).click();
  await expect(page.locator('.event-card')).toHaveCount(4);
  const menu = page.getByRole('button', { name: 'Actions for The next chapter' });
  await menu.click();
  await page.getByRole('menuitem', { name: 'Delete moment' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep moment' }).click();
  await expect(page.locator('.event-card')).toHaveCount(4);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('link', { name: 'New moment', exact: true }).first().click();
  await expect(page.getByLabel('Name your moment')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('creates a past event directly and rejects nonexistent DST times inline', async ({ page }) => {
  await page.goto('/events/new');
  await page.getByLabel('Name your moment').fill('A beautiful beginning');
  await page.getByLabel('The date', { exact: false }).fill('2026-03-08');
  await page.getByLabel('The exact moment', { exact: false }).check();
  await page.getByLabel('The time', { exact: false }).fill('02:30');
  await page.getByLabel('Timezone', { exact: true }).fill('America/New_York');
  await page.getByRole('button', { name: 'Save this moment' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'This local time does not exist' }),
  ).toBeVisible();
  await page.getByLabel('The time', { exact: false }).fill('03:30');
  await page.getByRole('button', { name: 'Save this moment' }).click();
  await expect(page).toHaveURL(/\/events\/[a-f0-9-]+$/);
  await expect(page.getByText('TIME SINCE', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'A beautiful beginning', exact: true }),
  ).toBeVisible();
});

test('key screens pass automated WCAG AA checks in both themes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark']) {
    await page.goto('/');
    await page.evaluate((value) => localStorage.setItem('timeverse:theme', value), theme);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(new RegExp(theme));
    await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1');
    const landing = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      landing.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
    await page.goto('/dashboard');
    const demo = page.getByRole('button', { name: 'Try demo events' });
    if (theme === 'light') await demo.click();
    await expect(page.locator('.event-card')).toHaveCount(4);
    const dashboard = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      dashboard.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
    await page.goto('/events/new');
    await expect(page.getByLabel('Name your moment')).toBeVisible();
    const form = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      form.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  }
});

test('a far-future timer remains readable at 320px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/dashboard');
  await page.evaluate(() => {
    localStorage.setItem(
      'timeverse:events:v1',
      JSON.stringify([
        {
          id: 'distant-future',
          title: 'A far-off dream',
          description: '',
          category: 'personal',
          emoji: '✨',
          accentColor: '#8b7bec',
          date: '9999-12-31',
          time: '23:59',
          dateMode: 'date-time',
          timezone: 'Asia/Colombo',
          createdAt: '2026-10-27T00:00:00.000Z',
          updatedAt: '2026-10-27T00:00:00.000Z',
        },
      ]),
    );
  });
  await page.goto('/events/distant-future');
  await expect(page.getByRole('heading', { name: 'A far-off dream' })).toBeVisible();
  await expect(page.locator('.timer-number').first()).toContainText(/\d{7}/);
  const fits = await page
    .locator('.timer-unit')
    .first()
    .evaluate((el) => {
      const value = el.querySelector('.timer-number')!.getBoundingClientRect();
      const cell = el.getBoundingClientRect();
      return value.left >= cell.left && value.right <= cell.right;
    });
  expect(fits).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
