# Reporte de Performance

## Tabla de Resultados

| Métrica | Seed chica | Seed grande |
|---|---:|---:|
| p95 (`http_req_duration`) | 329.69ms | 1m0s |
| Error rate (`http_req_failed`) | 0.00% | 90.9% |
| Iteraciones por segundo | 16.31741/s | 0.326346/s |
| `VUs` | 20 | 20 |
| `DURATION` | 1m | 1m |

## Hipótesis

La degradación del rendimiento podría estar causada principalmente por dos problemas en el endpoint de listado de tareas `listByProject` en `server/src/modules/tasks/tasks.controller.ts`:

* Falta de paginación efectiva: aunque se definen los parámetros limit y offset, estos no se utilizan al consultar el repositorio. Por lo tanto, podrían recuperarse todas las tareas del proyecto en lugar de limitar los resultados a 20 registros, como establece el valor predeterminado.
* Consultas N+1 a la base de datos: por cada tarea recuperada se ejecutan hasta dos consultas adicionales: una para obtener el usuario asignado (db.user.findUnique) y otra para contar sus comentarios (db.comment.count). Estas consultas se realizan secuencialmente debido a los await dentro del bucle.

Con la seed grande, que contiene 5000 tareas y 20000 comentarios, ambos problemas se amplifican: se procesan muchos más registros y se genera un volumen elevado de consultas a la base de datos. Además, al ejecutarse simultáneamente desde 20 usuarios virtuales, aumenta la competencia por los recursos de la base de datos, lo que podría provocar saturación y mayores tiempos de respuesta.

Esto se refleja en que el 90,9 % de las solicitudes falla por timeout, alcanzando el límite de 60 segundos de k6. Como consecuencia, disminuye considerablemente la cantidad de iteraciones por segundo y se incumplen los criterios de rendimiento establecidos.