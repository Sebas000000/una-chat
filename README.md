# UNA Chat — Autenticación Social con Auth0 & Software Factory (Laboratorio 8)

Aplicación **UNA Chat** desarrollada para el curso **Paradigmas de Programación** (Universidad Nacional de Costa Rica, **Campus Nicoya** — Prof. Ing. Alex Villegas Carranza, M.Sc.).

Este proyecto implementa la historia de usuario **US-01 (Autenticación Social OAuth con Auth0)** gobernada bajo la metodología **Software Factory (`factory/`)** y **Obsidian Second Brain (`brain/`)**.

---

## Características Principales (US-01)

- **Autenticación Social OAuth 2.0 / OIDC (PKCE):** Integración oficial con `@auth0/auth0-react` para proveedores sociales (Google / GitHub).
- **Guardia de Acceso Protegido (Fail-Closed):** Los usuarios no autenticados no pueden acceder ni visualizar la sala de mensajes; se les presenta una pantalla institucional de bienvenida con invitación a iniciar sesión.
- **Identidad de Usuario y Logout:** Muestra en tiempo real el avatar (`user.picture`), nombre (`user.name`) y correo (`user.email`) del estudiante autenticado, junto con el botón funcional **Cerrar sesión**.
- **Manejo de Errores y Cancelaciones en Español:** Si el usuario cancela el login social (`access_denied`) o ocurre un problema de red, se despliega una alerta clara con el botón **Intentar de nuevo**.
- **Sin Secretos en Git:** Parametrización completa mediante variables `VITE_AUTH0_*` documentadas en [`.env.example`](.env.example).

---

## 1. Requisitos Previos

- **Node.js** 18+ y **npm**
- Una cuenta gratuita en [Auth0](https://auth0.com/)
- Una cuenta en [Vercel](https://vercel.com/) vinculada a tu GitHub

---

## 2. Configuración Paso a Paso en Auth0 Dashboard

1. Ingresa a [Auth0 Dashboard](https://manage.auth0.com/) → **Applications** → **Applications** → **Create Application**.
2. Asigna el nombre **`UNA Chat`**, selecciona el tipo **`Single Page Web Applications`** (SPA) y haz clic en **Create**.
3. Ve a la pestaña **Settings** de tu aplicación y copia los valores de:
   - **Domain** (ej. `dev-xxxxxxxx.us.auth0.com`)
   - **Client ID** (ej. `aBcDeFgHiJkLmNoPqRsTuVwXyZ123456`)
   > **Nota de Seguridad:** En una SPA **nunca** utilices ni expongas el `Client Secret`.
4. En la misma pestaña **Settings**, desplázate a **Application URIs** y configura las URLs para entorno local y producción en Vercel (separadas por coma):
   - **Allowed Callback URLs:**
     ```text
     http://localhost:5173, http://localhost:3000, https://una-chat.vercel.app
     ```
   - **Allowed Logout URLs:**
     ```text
     http://localhost:5173, http://localhost:3000, https://una-chat.vercel.app
     ```
   - **Allowed Web Origins:**
     ```text
     http://localhost:5173, http://localhost:3000, https://una-chat.vercel.app
     ```
   *(Reemplaza `https://una-chat.vercel.app` por el dominio exacto que te asigne Vercel si es diferente).*
5. Haz clic en **Save Changes**.
6. En el menú lateral izquierdo, ve a **Authentication** → **Social** y verifica que al menos una conexión social (**Google / Gmail** o **GitHub**) esté activa y habilitada para la aplicación **`UNA Chat`**.

---

## 3. Instalación y Ejecución en Local

1. Clona el repositorio e instala las dependencias:
   ```bash
   git clone https://github.com/Sebas000000/una-chat.git
   cd una-chat
   npm install
   ```
2. Crea tu archivo `.env` local a partir de la plantilla `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Edita `.env` con el **Domain** y **Client ID** de tu aplicación Auth0:
   ```ini
   VITE_AUTH0_DOMAIN=tu-tenant.us.auth0.com
   VITE_AUTH0_CLIENT_ID=tu_client_id_publico_de_auth0
   VITE_AUTH0_CALLBACK_URL=http://localhost:5173
   ```
4. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre `http://localhost:5173` en tu navegador y prueba:
   - Que el chat esté bloqueado antes de iniciar sesión.
   - Iniciar sesión con Google o GitHub.
   - Verificar tu nombre, foto y correo en la barra superior y enviar un mensaje.
   - Cerrar sesión con el botón **Cerrar sesión**.

---

## 4. Pruebas Automatizadas (TDD) y Software Factory Pipeline

Para ejecutar la suite de pruebas unitarias y de integración (`Vitest` + `React Testing Library`):

```bash
npm test
```

Para ejecutar los comandos del **Software Factory Harness (`factory/`)**:

```bash
npm run factory:intake       # Registra el run f-20261103-us01
npm run factory:spec-check   # Verifica el spec SDD contra la constitución
npm run factory:worktree     # Crea/cambia a la rama aislada factory/f-20261103-us01-auth0
npm run factory:review-open  # Verifica los 4 reportes (security, ux, ui, code)
npm run factory:approve      # Genera el ledger approval.json
npm run factory:classify     # Clasifica el riesgo de release (LOW / HIGH)
npm run factory:release      # Marca el run como liberado
```

---

## 5. Despliegue en Vercel

1. Sube tus cambios a GitHub (`git push origin main`).
2. Entra a [Vercel Dashboard](https://vercel.com/new) e importa el repositorio **`Sebas000000/una-chat`**.
3. En la sección **Environment Variables** del proyecto en Vercel, agrega:
   - `VITE_AUTH0_DOMAIN` = `<tu-dominio-auth0>`
   - `VITE_AUTH0_CLIENT_ID` = `<tu-client-id-auth0>`
4. Haz clic en **Deploy**.
5. Una vez desplegado, copia la URL de producción generada por Vercel (ej. `https://una-chat-xxxx.vercel.app`) y agrégala en tu **Auth0 Dashboard** dentro de **Allowed Callback URLs**, **Allowed Logout URLs** y **Allowed Web Origins**.

