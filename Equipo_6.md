# Equipo 6 — Calificaciones por equipo, Testing y Calidad de Software 2026

**Repo:** https://github.com/JavierM1203/taskflow_2026_s2

Este archivo tiene solo las tareas calificadas por equipo. Las notas individuales (cuestionario de la clase 1, cuestionarios de Moodle y participación) se llevan aparte.

_Escala de las notas: 0-100._

## Tareas por equipo

| Tarea | Clase | Peso | Puntos del curso (máx., de 100) | Nota al corte (17/11, 11:46) | Aporta (puntos) | Nota con reentrega (17/11, 19:00-20:30) | Aporta (puntos) | Observaciones |
|---|---|---|---|---|---|---|---|---|
| Taller de refinamiento | 2 | 5,3 | 2,65 | pendiente |  | pendiente |  | Pendiente de entrega: no figura en el repo (se buscó en `docs/`, el README y las 17 ramas). |
| Integration + cobertura + refactor (código pestilente + Ej. 1 de clase 7) | 3 y 7 | 10,6 | 5,30 | 90 | 4,77 | 98 | 5,19 | Cuatro refactores en PRs chicos que preservan el comportamiento (verificado con 12 casos de `updateTask` contra el commit base) y cobertura de ramas de 53,94 % (líneas 79,24 %) con umbral de 40 % en Jest. Faltan los tests de caracterización previos y el listado escrito de los smells. **Reentrega:** `docs/reporte-smells.md` (PR #25) tiene la tabla de smells con dónde estaba, el refactor que lo resolvió y el hash del commit. Los 5 commits existen y coinciden con los refactors. Resta 2 puntos porque la columna "Smell" nombra el principio o el refactor (DRY, funciones pequeñas, nombres significativos) y no el smell del catálogo (Duplicated Code, Long Method, Mysterious Name). |
| Postman + Supertest, caza de bugs | 5 | 5,3 | 2,65 | 64 | 1,70 | 94 | 2,49 | Supertest con 25 tests nuevos (status, cuerpo y casos negativos; 34 de 36 pasan, los 2 rojos son bugs de la spec). Postman no se cuenta. **Al corte:** los 2 bugs de `clase5_errores.xlsx` no tienen criterio violado, entorno, reproducibilidad, evidencia ni severidad. **Reentrega:** los 2 bugs ahora son GitHub issues completos (#19 y #20, con etiquetas `bug` y de severidad, criterio citando la spec, entorno, pasos, reproducibilidad, test que lo reproduce y captura), y el Excel se completó con los mismos campos. En el Excel la columna "Evidencia" quedó vacía. |
| ADR | 6 | 5,3 | 2,65 | 50 | 1,32 | 80 | 2,12 | ADR con contexto, decisión y consecuencias, y framework con Page Objects, fixtures y base aislada. No implementaron Component Object (el ADR-003 lo rechaza) y el ADR no compara alternativas ni costos. **Reentrega (PR #18):** <br>• Component Object (24/30). `client/e2e/components/TaskCard.ts` recibe un `Locator` en el constructor, `BoardPage.taskCard()` lo devuelve y `changeTaskStatus` y `openTask` delegan en él. Corrí la suite E2E completa: no se rompió nada (los fallos son los bugs ya reportados). Pero `TaskCard` expone `getByTestId()` y `locator()` genéricos, así que los tests siguen escribiendo `taskCard.getByTestId('task-card-priority')`, etc.: los testids no quedaron encapsulados. <br>• ADR (6/10). El ADR-003 ahora tiene alternativas y un buen análisis del costo de no usar componentes. Pero quedó contradiciendo el código: sigue diciendo "No utilizar Component Object Model", estado "Rechazado" y "opción elegida: métodos sueltos en `BoardPage`", cuando el código hace lo contrario. |
| E2E + bugs | 7 y 8 | 10,6 | 5,30 | 67 | 3,55 | 100 | 5,30 | **Al corte:** corrí los 15 casos E2E con Chromium. 11 pasan y 4 fallan reproduciendo bugs reales de la spec: miembros que no se ven desde otro navegador, tareas que siguen asignadas al quitar un miembro, token inválido sin redirigir al login y TODO a DONE aceptado. Los 3 casos de zona horaria pasan con el servidor en UTC y fallan con `TZ=Pacific/Pago_Pago`. Cobertura de las historias pedidas: US-16 con 3 casos, US-14 con 1, US-15 y US-12 sin casos. Cinco GitHub issues completos (#9 a #13), todos abiertos por integrantes del equipo, con criterio violado, entorno, pasos, esperado y obtenido, reproducibilidad, evidencia, test que lo reproduce y severidad. **Reentrega:** en la rama `e2e-coverage-us12-us14-us15` sumaron 8 casos (US-12 con 3, US-14 con 3 en total y US-15 con 3). Los corrí: 5 pasan y 3 fallan reproduciendo los issues completos #22, #23 y #24. |
| Performance (k6: tabla seed chica vs grande + issue) | 9 | 5,3 | 2,65 | pendiente |  | 67 | 1,78 | **Al corte:** solo estaban el script `api-load.k6.js` y `seed-large.ts`, sin tabla de resultados, hipótesis ni issue. **Reentrega:** `docs/reporte-performance.md` tiene la tabla de seed chica contra seed grande (p95 83 ms contra 60 s; errores 0 % contra 90,9 %) y una hipótesis, y el issue #15 está completo (umbrales de k6, entorno, pasos, esperado y obtenido, captura e hipótesis). Faltan tres cosas. La tabla no dice VUs ni duración, y las corridas no tienen la misma carga: la chica da 0,94 iteraciones/s, que corresponde a 1 VU, y la grande se corrió con 20. La hipótesis es genérica y no señala la causa en el código ni explica que los errores son timeouts de 60 s. Y el issue no tiene etiquetas. |
| Seguridad + accesibilidad (npm audit + curl, axe-core) | 11 | 5,3 | 2,65 | 32 | 0,85 | 56 | 1,48 | **Al corte (32):** <br>• Seguridad 32/50. Headers revisados con `curl -I` (8/8), control de acceso probado (6/6) y user story de seguridad con 4 criterios testables (8/8). `npm audit` solo en la raíz y no en `server/` (4/8). Los hallazgos no están en la plantilla SEC-01 y SEC-02, y el reporte concluye "no se encontraron problemas" pese a los headers faltantes y el CORS abierto (6/20). <br>• Accesibilidad 0/50: no hay test con axe-core, hallazgos WCAG, corrección ni user story. <br>**Reentrega (56), rama `clase11_reporte_de_seguridad`:** <br>• Seguridad 38/50. Los hallazgos pasan a 12/20: SEC-01 a SEC-06 con severidad, CVSS y remediación, cruzados con un scan de OWASP ZAP. Les faltan descripción, pasos de reproducción e impacto, y quedaron afuera los dos hallazgos graves: el buscador de tareas es inyectable por SQL, aunque el reporte dice que se probó sin problemas, y `PATCH` y `DELETE` de tareas no validan membresía. `npm audit` sigue solo en la raíz (4/8). <br>• Accesibilidad 18/50. Test con axe-core sobre login, registro, proyectos y tablero, bien armado y corriendo (15/15). Documentan 0 violaciones con captura, pero no hay 3 hallazgos WCAG (3/15), ni corrección (`VERIFICAR.regla` en `null`, 0/12), ni user story (0/8). |
| Pipeline (`ci.yml` y job de E2E) | 12 | 10,6 | 5,30 | 91 | 4,82 | 91 | 4,82 | `ci.yml` con 5 jobs independientes y cache de npm en la rama `actions` (PR #14 sin mergear). Build de servidor y cliente verificados en local. El lint falla con 4 errores de código reales y tests y cobertura quedan rojos por los bugs de la spec (no se penalizan). Falta el job de E2E (opcional). |
| Presentación (por definir) | 16 | 15,9 | 7,95 | pendiente |  | pendiente |  | Pendiente: todavía no la hicieron. |
| Informe de una página | 12 | 12,8 | 6,40 | pendiente |  | pendiente |  | Pendiente de entrega: no hay informe en el repo (`docs/clase12-m2-reporte.md` es el reporte de seguridad). |
| **Total por equipo** | | **87,0** | **43,50** | 71 (promedio ponderado de 47,7 de peso calificado: 71,33) | **17,01** | 88 (promedio ponderado de 53,0 de peso calificado: 87,50) | **23,19** | **Al corte** faltaban: Taller de refinamiento, Performance, Presentación e Informe de una página. **Con la reentrega** faltan: Taller de refinamiento, Presentación e Informe de una página. |
| Tareas individuales (Moodle 6, participación 5, cuestionario clase 1 2; pesos provisorios) |  | 13 | 6,50 |  | pendiente |  | pendiente | Se llevan aparte, ver `Calificacion_final.md`. |
| **Proyecto final corregido** |  |  | **50,00** | pendiente | pendiente | pendiente | pendiente | Vale el 50 % de la nota final. Se califica después de que arreglen lo señalado en estas tareas. |
| **Total del curso** |  |  | **100,00** |  | **17,01** de 100 |  | **23,19** de 100 | Hasta ahora; faltan individuales y proyecto final. 43,50 (equipo) + 6,50 (individuales) + 50,00 (proyecto). |

_Los 13 de peso restantes de las tareas (6,5 puntos del curso: Moodle 6, participación 5, cuestionario clase 1 2) son individuales. Pesos provisorios, pendientes de confirmar._

## Proyecto corregido

| Concepto | Nota | Observaciones |
|---|---|---|
| Nota del proyecto corregido (incluye Rúbrica C de Pact) | | |

## Sugerencias de arreglo para el equipo (2026-11-17)

Las sugerencias parten del estado del repo después de la reentrega del 17/11 por la tarde. Notas en escala 0-100. Los "GitHub issues" son los tickets de la pestaña Issues del repo. `main` ya tiene los E2E, el reporte de performance, el ADR corregido, los smells y el Excel de la clase 5. Siguen sin mergear `actions` (CI), `pact`, `e2e-coverage-us12-us14-us15` y `clase11_reporte_de_seguridad` (además de las viejas `reporte_seguridad` y `clase12-m2-seguridad-accesibilidad`, que la última reemplaza). Conviene mergearlas a `main` (ojo: no mergear `refactor-update-task-small-functions`, que borra `ADR.md` y `clase5_errores.xlsx`).

### Seguridad + accesibilidad

Nota con la reentrega: 56/100 (seguridad 38/50, accesibilidad 18/50; al corte era 32), calificada sobre la rama `clase11_reporte_de_seguridad`. El scan de ZAP y los puntajes CVSS están bien hechos y quedan como valor agregado. Con lo que sigue se pueden recuperar los 44 puntos que faltan. Todo va en `docs/clase12-m2-reporte.md` (más `client/e2e/tests/a11y.spec.ts`), mergeado a `main`. El reporte enlaza `3_headers_health.png` y `3_headers_projects.png`, que no están en el repo: hay que subirlas.

**Seguridad (faltan 12 puntos)**

- **`npm audit` también en `server/` y `client/` (4 puntos).** En la raíz solo aparece `shell-quote` (CRITICAL, de desarrollo). En `server/` hay vulnerabilidades HIGH en dependencias de producción (`body-parser`, que trae Express, y `brace-expansion`) y en `client/` HIGH en `@remix-run/router`. Correr `npm audit --audit-level=high` en cada carpeta y `npm audit --omit=dev` en `server/`, y anotar paquete, severidad, si va a producción y si tiene fix.
- **Hallazgos completos y los dos graves que faltan (8 puntos).** Cada SEC tiene que tener, además de lo que ya tiene, descripción, pasos de reproducción con los comandos `curl` exactos e impacto. Los headers y el CORS están bien detectados, pero son los hallazgos menores. La API tiene dos más graves, que las herramientas automáticas no ven y hay que buscar con `curl`:
  - **Inyección SQL en el buscador de tareas (CRITICAL).** El reporte dice que se probó y que no hay problema, pero sí lo hay. En `server/src/modules/tasks/tasks.repository.ts`, la búsqueda arma el SQL concatenando el texto del usuario dentro de `$queryRawUnsafe`. Cómo encontrarlo:
    1. Buscar con una sola comilla: `curl -G http://localhost:3000/api/projects/PROJ/tasks --data-urlencode "search='" -H "Authorization: Bearer TOKEN"`. Un error 500 en vez de una lista vacía es la primera señal.
    2. Cerrar la condición y agregar una propia: `search=x') > 0) OR 1=1 --`. Con el token de Bob y el ID de un proyecto de Bob, devuelve las tareas de los proyectos de Ana.
    3. Con un `UNION SELECT ... FROM users --` se pueden leer el email y el hash de la contraseña de todos los usuarios.
    
    Lo verifiqué contra `main`: los tres pasos funcionan. La remediación es usar `$queryRaw` con parámetros, o `contains` de Prisma.
  - **Control de acceso roto en tareas (HIGH, OWASP A01).** La prueba que hicieron fue sobre el listado de proyectos, que sí filtra por membresía, pero hay que probar también las rutas por ID. En `server/src/modules/tasks/tasks.routes.ts:14-15`, `PATCH` y `DELETE /api/tasks/:taskId` no tienen `requireTaskProjectMember`, así que un usuario que no es miembro recibe 200 o 204 en vez de 403. Ya lo tienen como bug en los issues #20 y #24: hay que llevarlo al reporte como hallazgo de seguridad.

**Accesibilidad (faltan 32 puntos)**

El test está bien armado. El problema es que recorre solo vistas que no tienen violaciones: login, registro, proyectos y tablero dan 0, y ese resultado es correcto.

- **Dónde están los issues (parte de los 12 puntos de hallazgos).** Agregar a `VISTAS` el **detalle de tarea** (`/projects/:id/tasks/:taskId`): crear una tarea con la API y abrirla. Ahí axe reporta:
  - `label` (CRITICAL, SC 1.3.1 y 4.1.2, nivel A): el input de etiquetas (`tag-add-input`) y el textarea de comentarios (`comment-add-input`) no tienen label (`client/src/pages/TaskDetailPage.tsx:335` y `:351`).
  - `page-has-heading-one` (best practice): la vista no tiene `<h1>`.

  Agregar también la vista de miembros.
- **Revisión manual para completar los hallazgos.** axe automatiza solo una parte de WCAG. Recorrer la app con teclado (Tab, Enter y Escape) y con el lector de pantalla del sistema (VoiceOver con Cmd+F5 en Mac, o NVDA en Windows):
  - Todas las rutas tienen el mismo `<title>` "TaskFlow": falla el SC 2.4.2, Página titulada (A).
  - El botón para quitar una etiqueta solo dice "×" y el lector lo anuncia así, sin decir qué etiqueta quita: SC 2.4.6 (AA) y 4.1.2 (A).
- **3 hallazgos ACC-01 a ACC-03 (12 puntos).** Cada uno con SC WCAG 2.1, nivel A o AA, principio POUR, vista afectada, descripción del fallo con el HTML del elemento, y fix propuesto.
- **Corregir una violación y volver a correr el test (12 puntos).** Por ejemplo, envolver el input de etiquetas en `<label className="field"><span>Nueva etiqueta</span>...</label>`. Después poner `VERIFICAR = { regla: 'label', vistas: ['Detalle de tarea'] }` y pegar en el reporte la corrida en rojo de antes del fix y la corrida en verde de después.
- **User story de accesibilidad (8 puntos).** Con el formato Como, Quiero y Para, y al menos 3 criterios de aceptación testables, como la de seguridad. Por ejemplo: "axe no reporta violaciones WCAG 2.1 AA en el detalle de tarea", "cada campo del detalle tiene nombre accesible al recorrerlo con Tab" y "cada ruta tiene un `<title>` propio".

### ADR
Nota con la reentrega: 80 (al corte era 50).
- **ADR-003 alineado con el código (4 puntos).** Como ya implementaron `TaskCard`, el ADR tiene que decir lo que hicieron. Hay dos formas:
  - Cambiar el ADR-003 a "Utilizar Component Object Model", con estado **Aceptado** y la opción elegida corregida.
  - Mejor: dejar el ADR-003 como **Reemplazado por ADR-005** y agregar un ADR-005 que cuente por qué cambiaron de decisión. El costo que ya escribieron sirve de contexto.
  
  Ojo también con "Status: Rechazado" junto a "Decisión: No utilizar": es una doble negación que no se entiende.
- **Encapsular los testids en `TaskCard` (6 puntos).** Sacar `getByTestId()` y `locator()` genéricos y exponer métodos con nombre: `priority()`, `status()`, `assignee()`, `dueDate()`, `title()` (que devuelvan el `Locator` correspondiente). Así los tests quedan como `expect(card.priority()).toHaveText('HIGH')`, y si cambia un testid se toca un solo archivo, que es justo el costo que describe su ADR.

### E2E + bugs
- **Completo (100).** Falta mergear `e2e-coverage-us12-us14-us15` a `main`.
- **Sin puntos:** ponerles a los #9 a #13 las etiquetas `bug` y de severidad, como ya tienen los #22 a #24.

### Postman + Supertest
- **Evidencia en el Excel (6 puntos).** En `clase5_errores.xlsx` la columna "Evidencia" está vacía. Completarla con el link a los issues #19 y #20 o a la captura de la corrida de Jest.

### Performance
- **Misma carga en las dos corridas (12 puntos).** La seed chica se corrió con 1 VU (0,94 iteraciones/s con `sleep(1)`) y la grande con 20. Así la comparación mezcla dos cambios a la vez. Correr las dos seeds con el mismo comando (`-e VUS=20 -e DURATION=1m`) y poner VUs y duración en la tabla.
- **Hipótesis que señale la causa en el código (18 puntos).** La causa está en `server/src/modules/tasks/tasks.controller.ts`, en `listByProject`:
  - Trae todas las tareas del proyecto y después, por cada tarea, hace dos consultas más: `db.user.findUnique` y `db.comment.count`. Es un N+1: con 5000 tareas son unas 10 000 consultas por request.
  - Ignora `limit` y `offset`: los calcula pero no se los pasa a la consulta, así que devuelve todas las tareas aunque la respuesta diga `limit: 20`.
  - El 90,9 % de errores son timeouts: k6 corta a los 60 s, que es justo el p95 medido.
  
  Para comprobarlo, prender el log de consultas de Prisma (`log: ['query']`) o medir un solo request con `curl -w "%{time_total}"`. La remediación es `include` con `_count` y `take`/`skip`.
- **Etiquetas en el issue #15 (3 puntos).** Agregar `performance` y la de severidad.

### Pipeline
- **Lint en rojo:** corregir los 4 errores de `server/src/modules/comments/comments.service.ts` (`any` y variable sin usar) y `projects.controller.ts` (import `forbidden` sin usar), y mergear `actions` a `main`. 6 puntos.
- **Job de E2E (opcional):** agregar un job con checkout, setup-node con cache, `npm ci`, `npx prisma generate` (en `server`), `npx playwright install --with-deps chromium` y `npm run test:e2e`, subiendo el reporte como artefacto. 3 puntos.

### Integration + cobertura + refactor
- **Nombre del smell (2 puntos).** En `docs/reporte-smells.md`, la columna "Smell" tiene que nombrar el smell del catálogo de Fowler, no el principio ni el refactor:
  - Código duplicado → **Duplicated Code**.
  - `updateTask` larga → **Long Method**.
  - Parámetros `m`/`d` → **Mysterious Name**.
  
  El principio (DRY) y el refactor aplicado (Extract Function, Rename Variable) pueden ir en la columna del refactor.

### Pendientes de entrega
- Presentación e Informe de una página.
