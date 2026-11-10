# Reporte de Seguridad y Accesibilidad

## Headers de seguridad

| Header | ¿Aparece? | Qué significa si falta (o si sobra) |
|---|---|---|
| `Content-Security-Policy` | No | Mitiga XSS limitando de dónde se ejecuta JavaScript |
| `Strict-Transport-Security` | No | Fuerza HTTPS. Solo tiene efecto sobre HTTPS, pero igual es configuración faltante para producción |
| `X-Frame-Options` | No | Evita clickjacking (embeber la app en un iframe malicioso) |
| `X-Content-Type-Options` | No | Evita que el navegador "adivine" el tipo de contenido (`nosniff`) |
| `X-Powered-By` | Sí | Si aparece, **sobra**: revela la tecnología del servidor |
| `Access-Control-Allow-Origin` | Sí | Si vale `*`, cualquier sitio web puede llamar a la API desde un navegador |

## Análisis de dependencias

El comando `npm audit` arrojó una sola vulnerabilidad.

| | |
|---|---|
|**Aspecto** |	Vulnerabilidad: shell-quote |
|**Severidad** |	CRITICAL |
|**Tipo de dependencia** |	Desarrollo y test. No aparece entre las dependencias de producción, ya que npm audit --omit=dev no detectó vulnerabilidades. |
| **Problema** | Posible inyección de comandos (command injection) mediante la función quote(). |
| **¿Tiene arreglo disponible?**	| Sí. npm audit indica que existe una solución mediante npm audit fix. |
| **¿Es un cambio breaking?** |	No se indica que sea necesario un cambio incompatible. npm audit fix intenta resolver las vulnerabilidades mediante actualizaciones compatibles con las restricciones de versiones existentes. |

## Hallazgos de seguridad

Se realizaron las siguientes pruebas y no se encontraron problemas de seguridad:

- Acceder a proyecto con token de usuario que no es miembro del proyecto
- Inyección SQL en login y buscador de tareas
- XSS almacenado al crear tarea
- Acceso con token sin firma.


## Control de seguridad verificado

| | |
|---|---|
| **Qué se probó** | Acceder a proyecto con token de usuario que no es miembro del proyecto |
| **Resultado esperado** | No se permite acceder al proyecto |
| **Resultado obtenido** | No se permite acceder al proyecto |
| **Qué parte del código lo explica** | Función *list* en archivo *projects.controller.ts* de server |

| | |
|---|---|
| **Qué se probó** | Acceder a proyectos con token sin firma |
| **Resultado esperado** | No se permite acceder y se obtiene error de autorización |
| **Resultado obtenido** | No se permite acceder y se obtiene error de autorización |
| **Qué parte del código lo explica** | Función *authenticate* en archivo *middleware/auth.ts* de server |
