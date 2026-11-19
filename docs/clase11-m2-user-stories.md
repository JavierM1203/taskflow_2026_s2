| *US de Accesibilidad — Hallazgo más grave* | |
|---|---|
| **Como** | usuario de lector de pantalla o con varias pestañas abiertas |
| **Quiero** | que cada vista de TaskFlow tenga un título de página que describa su contenido y que cambie al navegar entre vistas |
| **Para** | saber en qué pantalla estoy y distinguir la pestaña de TaskFlow de otras (WCAG 2.4.2, nivel A) |
| **CA-01** | Con la app corriendo, el título de `/login` es "Ingresar — TaskFlow" y el de `/projects` es "Proyectos — TaskFlow" (`await expect(page).toHaveTitle(...)` en Playwright) |
| **CA-02** | El título de la vista de un proyecto incluye el nombre del proyecto, y al navegar con un clic entre vistas (sin recargar) el título cambia |
| **CA-03** | Ningún par de vistas distintas comparte el mismo título; un test que visite Login, Proyectos y un proyecto lo comprueba |
| **CA-04** | `npx playwright test a11y --project=chromium` informa 0 violaciones WCAG 2.1 AA en las 4 vistas y el test de títulos queda en verde dentro de la misma suite |