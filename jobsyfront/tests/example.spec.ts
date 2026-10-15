import { test, expect } from '@playwright/test';

// Identifiants fournis par l'environnement (jamais en dur dans le dépôt) :
//   E2E_BASE_URL=http://localhost:3000 E2E_CANDIDATE_EMAIL=... E2E_CANDIDATE_PASSWORD=... npx playwright test
const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const email = process.env.E2E_CANDIDATE_EMAIL;
const password = process.env.E2E_CANDIDATE_PASSWORD;

test('un candidat se connecte et accède aux missions', async ({ page }) => {
  test.skip(!email || !password, 'E2E_CANDIDATE_EMAIL / E2E_CANDIDATE_PASSWORD non définis');

  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Connexion' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email!);
  await page.getByRole('textbox', { name: '••••••••' }).fill(password!);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page).toHaveURL(/\/dashboard\/candidats/);
  await page.getByRole('button', { name: 'Missions' }).click();
  await expect(page.getByRole('button', { name: 'Postuler' }).first()).toBeVisible();
});
