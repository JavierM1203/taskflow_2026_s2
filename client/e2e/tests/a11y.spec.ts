import AxeBuilder from '@axe-core/playwright';
import type { APIRequestContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { createProject, registerUser } from '../support';
import type { LoginPage } from '../pages/LoginPage';

/**
 * Auditoría de accesibilidad WCAG 2.1 AA — Clase 12, Módulo 2 (adaptada a este repo).
 *
 * Cómo se usa (desde la raíz del repo):
 *   1. Informe:   npx playwright test a11y --project=chromium
 *   2. Leer la salida: regla de axe, criterio de éxito (SC) de WCAG, nivel y elementos afectados.
 *   3. Corregir UNA violación en client/src/.
 *   4. Poner el id de esa regla en VERIFICAR.regla y volver a correr: rojo -> verde.
 */

const TAGS_WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Completar después de corregir una violación. Ej.: regla: 'label' */
const VERIFICAR: { regla: string | null; vistas: string[] } = {
  regla: null,
  vistas: ['Login'],
};

interface Ctx {
  page: Page;
  request: APIRequestContext;
  loginPage: LoginPage;
}

/** Registra un usuario por la API, inicia sesión por la UI y devuelve el usuario. */
async function conSesion({ page, request, loginPage }: Ctx) {
  const user = await registerUser(request);
  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  await expect(page).toHaveURL(/\/projects$/);
  return user;
}

const VISTAS: { nombre: string; abrir: (ctx: Ctx) => Promise<void> }[] = [
  {
    nombre: 'Login',
    abrir: async ({ loginPage, page }) => {
      await loginPage.goto();
      await expect(page.getByTestId('login-form')).toBeVisible();
    },
  },
  {
    // No hay ruta /register: el registro es el mismo formulario en modo "Crear cuenta".
    nombre: 'Registro',
    abrir: async ({ loginPage, page }) => {
      await loginPage.goto();
      await page.getByTestId('login-mode-toggle').click();
      await expect(page.getByTestId('login-name-input')).toBeVisible();
    },
  },
  {
    nombre: 'Proyectos',
    abrir: async (ctx) => {
      const user = await conSesion(ctx);
      await createProject(ctx.request, user);
      await ctx.page.goto('/projects');
      await expect(ctx.page.getByTestId('project-card').first()).toBeVisible();
    },
  },
  {
    nombre: 'Detalle de proyecto',
    abrir: async (ctx) => {
      const user = await conSesion(ctx);
      const project = await createProject(ctx.request, user);
      await ctx.page.goto(`/projects/${project.id}`);
      await expect(ctx.page.getByTestId('board-page')).toBeVisible();
    },
  },
];

function tagASc(tag: string): string | null {
  const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

function nivel(tags: string[]): string {
  return tags.some((t) => t.endsWith('aa')) ? 'AA' : 'A';
}

async function auditar(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS_WCAG).analyze();
  return violations;
}

// 1) Informe (no falla: sirve para leer y documentar los hallazgos)
test.describe('Informe de accesibilidad WCAG 2.1 AA', () => {
  for (const vista of VISTAS) {
    test(`${vista.nombre}: informe de violaciones`, async ({ page, request, loginPage }, testInfo) => {
      await vista.abrir({ page, request, loginPage });
      const violations = await auditar(page);

      console.log(`\n=== ${vista.nombre}: ${violations.length} regla(s) violada(s) ===`);
      for (const v of violations) {
        const sc = v.tags.map(tagASc).filter(Boolean).join(', ');
        console.log(`\n[${(v.impact ?? 'n/a').toUpperCase()}] ${v.id} — ${v.help}`);
        console.log(`   SC WCAG: ${sc || 'n/a'}  ·  Nivel ${nivel(v.tags)}`);
        console.log(`   Elementos afectados: ${v.nodes.length}`);
        v.nodes.slice(0, 3).forEach((n) => console.log(`   · ${n.target.join(' ')}`));
        console.log(`   Más info: ${v.helpUrl}`);
      }

      await testInfo.attach(`axe-${vista.nombre}.json`, {
        body: JSON.stringify(violations, null, 2),
        contentType: 'application/json',
      });
    });
  }
});

// 2) Verificación de la corrección (rojo -> verde)
test.describe('Verificación de la corrección', () => {
  test.skip(!VERIFICAR.regla, 'Definí VERIFICAR.regla con el id de la regla que corregiste');

  for (const vista of VISTAS.filter((v) => VERIFICAR.vistas.includes(v.nombre))) {
    test(`${vista.nombre}: ya no hay violaciones de "${VERIFICAR.regla}"`, async ({
      page,
      request,
      loginPage,
    }) => {
      await vista.abrir({ page, request, loginPage });
      const ids = (await auditar(page)).map((v) => v.id);
      expect(ids).not.toContain(VERIFICAR.regla);
    });
  }
});
