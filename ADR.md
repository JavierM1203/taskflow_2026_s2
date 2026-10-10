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

**Status:** Rechazado

**Contexto:**  
La estructura actual del proyecto no cuenta con componentes independientes extraídos de las páginas.

**Decisión:**  
No utilizar el patrón Component Object Model (COM).

**Consecuencias:**  
Se evita agregar una capa de abstracción que actualmente no aporta beneficios al proyecto.

---

## ADR-004: No utilizar Screenplay Pattern

**Status:** Rechazado

**Contexto:**  
El proyecto tiene una complejidad y escala reducidas.

**Decisión:**  
No utilizar el patrón Screenplay.

**Consecuencias:**  
Se mantiene una estructura de pruebas más simple, evitando complejidad innecesaria.