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

### Evidencia
![Paso 3.1 Headers del endpoint health](3_headers_health.png)

![Paso 3.2 Headers de un endpoint protegido](3_headers_projects.png)

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


## Hallazgos de accesibilidad

No se han encontrado vulnerabilidades o bug mediante el test con axe-core

>[!NOTE]
> Se altero el archivo de a11y.spec debido a que usaba endpoint obsoletos

![Salida de los test de a11y.spec](image-1.png)

Debido a que no hubo hallazgo a la vista se uso el comando `npx playwright test a11y --project=chromium --reporter=htm` para guardar el reporte. Se puede usar el comando `npx playwright show-report` para ver el html del reporte

## OWASP ZAP

Se ejecuto un escaneo automatico contra la app utilizando la applicacion de escritorio de OWASP ZAP

![lista de alertas Owasp](image.png)


El reporte completo está en el html `zap-5173.html` 

### Tabla de las alertas
|#|	Alerta|	Riesgo|	Instancias|	URLs afectadas|	CWE / WASC|	Plugin|	Solución propuesta|
|---|---|---|---|---|---|---|---|
|1|	Cabecera Content Security Policy (CSP) no configurada|	Medio|	5|	/, /@vite, /robots.txt, /sitemap.xml, /src|	693 / 15|	10038|	Configurar la cabecera Content-Security-Policy en el servidor|
|2|	Configuración incorrecta Cross-Domain|	Medio|	Systemic|	/, /@vite/client, /robots.txt, /sitemap.xml, /src/main.tsx|	264 / 14|	10098|	Restringir Access-Control-Allow-Origin a dominios concretos o quitar los headers CORS. Evidencia: Access-Control-Allow-Origin: *|
|3|	Falta de cabecera Anti-Clickjacking|	Medio|	5|	/, /@vite, /robots.txt, /sitemap.xml, /src|	1021 / 15|	10020|	Enviar X-Frame-Options (p. ej. SAMEORIGIN) o frame-ancestors en la CSP|
|4|	El servidor divulga información mediante X-Powered-By|	Bajo|	1|	/api/health|	497 / 13|	10037|	Suprimir el header. Evidencia: x-powered-by: Express|
|5|	Falta encabezado X-Content-Type-Options|	Bajo|	Systemic|	/, /@vite/client, /robots.txt, /src/main.tsx|	693 / 15|	10021|	Enviar X-Content-Type-Options: nosniff|
|6|	Aplicación Web Moderna|	Informativo|	5|	/, /@vite, /robots.txt, /sitemap.xml, /src|	n/a|	10109|	Ninguna: ZAP solo avisa que es una SPA|
