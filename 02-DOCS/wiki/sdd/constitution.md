# Constitución del Sistema — UNA Chat (SDD + Software Factory)

> **TL;DR:** Principios arquitectónicos, restricciones de seguridad y reglas de calidad innegociables para **UNA Chat** (Paradigmas de Programación — UNA Campus Nicoya).

## 1. Arquitectura Base

- **Frontend:** Single Page Application (SPA) construida con **React 18**, **Vite** y **TypeScript** en modo estricto (`strict: true`).
- **Autenticación e Identidad:** Delegada al proveedor OAuth 2.0 / OpenID Connect **Auth0** mediante el SDK oficial `@auth0/auth0-react` utilizando el flujo **Authorization Code Flow with PKCE**.
- **Despliegue:** Preparado para operación dual sin cambios de código en entorno local (`http://localhost:5173` / `http://localhost:3000`) y producción en **Vercel** (`https://<proyecto>.vercel.app`).

## 2. Reglas Innegociables de Seguridad

1. **Cero Secretos en Repositorio:** Ningún archivo `.env` ni clave privada puede almacenarse en el árbol de Git.
2. **Prohibición de Client Secret en SPA:** El frontend solo consume `VITE_AUTH0_DOMAIN` y `VITE_AUTH0_CLIENT_ID` (credenciales públicas de SPA).
3. **Acceso Protegido por Defecto (Fail-Closed Auth Guard):** Ningún usuario no autenticado (`isAuthenticated === false`) puede visualizar los mensajes ni enviar textos en la sala de chat; debe presentarse una pantalla clara de invitación a iniciar sesión social.

## 3. Reglas de Calidad y Gobernanza (Software Factory)

1. **Spec-Driven Development (SDD):** Ninguna funcionalidad se implementa sin una especificación aprobada (`spec.md`) en `02-DOCS/wiki/sdd/runs/<runId>/`.
2. **Test-Driven Development (TDD):** Toda historia de usuario requiere pruebas automatizadas con Vitest y React Testing Library que verifiquen los caminos felices y de error antes de dar por buena la implementación.
3. **Revisión Cuádruple Independiente:** Antes de aprobar un release (`approval.json`), la entrega debe ser auditada bajo 4 lentes: **Security**, **UX**, **UI** y **Code**.

