# Módulo 2 – Testing de Seguridad y Accesibilidad

## 4.4 User Stories de remediación

Base de la US de Seguridad: observación de headers de `docs/clase12-m2-reporte.md` (rama `origin/reporte_seguridad`) — faltan `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` y `X-Content-Type-Options`; sobra `X-Powered-By`; `Access-Control-Allow-Origin` responde `*`. En el código esto corresponde a `app.use(cors())` sin configurar y a que Express no tiene deshabilitado `X-Powered-By`, en `server/src/app.ts:11-13`.

| **US de Seguridad — Hallazgo más crítico** | |
|---|---|
| **Como** | responsable de seguridad de TaskFlow |
| **Quiero** | que la API configure CORS con un whitelist de orígenes y agregue los headers de seguridad faltantes (CSP, X-Frame-Options, X-Content-Type-Options y HSTS en producción), y que deje de exponer `X-Powered-By` |
| **Para** | reducir la superficie de ataque frente a requests cross-origin no autorizados, clickjacking, MIME-sniffing y fingerprinting de la tecnología del servidor |
| **CA-01** | `curl -sI http://localhost:3000/api/health` responde con `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`, y **no** incluye el header `X-Powered-By` |
| **CA-02** | Con `curl -sI -H "Origin: https://evil.example" http://localhost:3000/api/health` la respuesta **no** incluye `Access-Control-Allow-Origin: https://evil.example` (CORS rechaza el origen no permitido), mientras que con `curl -sI -H "Origin: http://localhost:5173" http://localhost:3000/api/health` la respuesta sí incluye `Access-Control-Allow-Origin: http://localhost:5173` |
| **CA-03** | Existe un test en `server/tests` (Jest + supertest) que hace un request a `GET /api/health` y falla si falta `X-Content-Type-Options`, si falta `X-Frame-Options`, si falta `Content-Security-Policy`, si aparece el header `X-Powered-By`, o si `Access-Control-Allow-Origin` se refleja para un `Origin` arbitrario no incluido en la whitelist; ese test corre dentro de `npm test` y queda en verde |
| **CA-04** | Con `NODE_ENV=production`, la respuesta de `GET /api/health` incluye `Strict-Transport-Security` con `max-age` de al menos `15552000`; con `NODE_ENV` en desarrollo (valor distinto de `production`), la respuesta **no** incluye ese header |
