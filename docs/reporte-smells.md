## Code Smells

| Smell | Dónde estaba | Refactor que lo resolvió | commit |
|---|---:|---:|---:|
| DRY - Validacion duplicada de email | auth/auth.service.ts | Se elimina la validación de email definida en auth.service.ts para register y forgotPasswortd y se reutiliza la que ya esta en validation.ts | 2cad0f3124e92e5241de77a13fe3e6804ff6a914 |
|  DRY - Validacion de owner y miembros | projects/projects.controller.ts | Se centraliza la lógica para validar si el usuario es owner y/o miembro del proyecto en membership.ts para ser reutilizada al modificar proyecto o miembros del proyecto en projects.controller.ts. | 60b0c2e7f1443a9057e849057e575b79d1de0929 |
| Funciones pequeñas - Separar responsabilidades de updateTask | tasks/tasks.service.ts | Extrae la validación y autorización de estados a funciones específicas y guarda la actualización de la tarea y su historial en una transacción. | e771c478b0696cb6570f1e7c3d2456f20b4aac88 |
| DRY - Unifica middlewares de membership y saca generalidad sin uso | middleware/membership.ts | requireProjectMember y requireTaskProjectMember tenían el mismo try/catch y los mismos 3 chequeos (usuario autenticado, recurso existente, membresía), solo cambiaba de dónde sacaban el projectId. Se extrae ese esqueleto común a requireMembership() y cada uno pasa solo cómo resolver el projectId. | 985798c96b2fa69c37572accd1e3c6be2f52ab61 |
| Nombres significativos en los factories de error | lib/http.ts | badRequest, unauthorized, forbidden, notFound, conflict e invalidTransition usaban parámetros m/d en vez de message/details. Es un archivo usado por todos los controllers del backend, así que el nombre críptico no aportaba nada y dificultaba leer las firmas. | 8595c5638884bdda4492a3fba49742cc7478c2aa |

