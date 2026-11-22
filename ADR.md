# Arquitecture Decision Record  

## ADR-001: Utilizar Page Object Model

**Status:** Aceptado

**Contexto:**  
El proyecto cuenta con múltiples páginas y sus correspondientes clases de React ya están creadas.

**Decisión:**  
Utilizar el patrón Page Object Model (POM) para estructurar los tests.

**Consecuencias:**  
Se mejora la organización y reutilización del código de pruebas, facilitando su mantenimiento.

---

## ADR-002: Utilizar Fixtures

**Status:** Aceptado

**Contexto:**  
Existen acciones que se repiten en diferentes tests, como la creación de proyectos.

**Decisión:**  
Utilizar Fixtures para centralizar y reutilizar acciones comunes.

**Consecuencias:**  
Se reduce la duplicación de código y se facilita la preparación de datos para pruebas, como las relacionadas con el CRUD de tareas.

---

## ADR-003: No utilizar Component Object Model

**Status:** Reemplazado por ADR-005

**Contexto:**  
La estructura actual del proyecto no cuenta con componentes independientes extraídos de las páginas.

**Alternativas consideradas:**  
- Extraer un Component Object (por ejemplo `TaskCard`) que reciba un `Locator` en el constructor y encapsule las acciones sobre una tarjeta del tablero (abrirla, cambiar su estado), para que `BoardPage` delegue en él en lugar de repetir los mismos `getByTestId(...)` en cada método.
- Mantener esas acciones como métodos sueltos dentro de `BoardPage` (`taskCard`, `changeTaskStatus`, `openTask`) — opción elegida.

**Decisión:**  
No utilizar el patrón Component Object Model (COM).

**Costo de no utilizarlo:**  
- `BoardPage` ya repite el mismo patrón `taskCard(title).getByTestId(...)` en `changeTaskStatus` y `openTask`: si cambia el testid o el rol con el que se ubica una tarjeta, hay que actualizar cada método de `BoardPage` que la toca, en vez de un solo lugar.
- Si otra página necesitara reutilizar esas mismas acciones sobre una tarjeta, habría que volver a escribirlas ahí, duplicando selectores entre Page Objects.
- A medida que crezcan las acciones sobre la tarjeta, `BoardPage` concentra responsabilidades que no le corresponden (no solo navegar la página, también operar una tarjeta puntual), lo que dificulta testear ese componente de forma aislada.

**Consecuencias:**  
Se evita agregar una capa de abstracción que actualmente no aporta beneficios al proyecto, a costa de la duplicación y el acoplamiento descritos arriba. Si la cantidad de acciones sobre la tarjeta sigue creciendo, conviene revisar esta decisión.

---

## ADR-004: No utilizar Screenplay Pattern

**Status:** Rechazado

**Contexto:**  
El proyecto tiene una complejidad y escala reducidas.

**Decisión:**  
No utilizar el patrón Screenplay.

**Consecuencias:**  
Se mantiene una estructura de pruebas más simple, evitando complejidad innecesaria.

---

## ADR-005: Utilizar Component Object Model

**Status:** Aceptado (reemplaza a ADR-003)

**Contexto:**  
El ADR-003 había rechazado usar Component Object Model, aceptando como costo la duplicación de selectores y el acoplamiento que esa misma decisión describía. Ese costo se dio en la práctica: `BoardPage.changeTaskStatus` y `BoardPage.openTask` repetían `taskCard(title).getByTestId(...)` para cada acción sobre una tarjeta del tablero, y cualquier cambio de testid obligaba a tocar cada método que la usara.

**Decisión:**  
Usar Component Object Model para los elementos de UI que se repiten. Se extrajo `TaskCard` (`client/e2e/components/TaskCard.ts`): recibe un `Locator` en el constructor y expone métodos con nombre por cada campo de la tarjeta (`title()`, `priority()`, `status()`, `assignee()`, `dueDate()`), en lugar de un `getByTestId()`/`locator()` genéricos. `BoardPage.taskCard()` devuelve una instancia de `TaskCard`, y los tests leen y operan la tarjeta a través de esos métodos.

**Consecuencias:**  
Si cambia el testid de un campo de la tarjeta, se actualiza un solo lugar (`TaskCard`), no cada Page Object o spec que la use — el costo que describía el ADR-003 queda resuelto. A cambio, cada campo nuevo de la tarjeta necesita agregar su método correspondiente en `TaskCard` en vez de leerlo ad hoc con `getByTestId`.