# Especificación Técnica SDD — US-01: Autenticación Social OAuth con Auth0

- **Run ID:** `f-20261103-us01`
- **Historia de Usuario:** `US-01`
- **Rama de Trabajo:** `factory/f-20261103-us01-auth0`
- **Estado:** `SPEC_VERIFIED`

---

## 1. Contexto y Constitución

Esta especificación se rige por la [Constitución del Sistema](../../constitution.md). El objetivo es dotar a **UNA Chat** de autenticación social federada (Google / GitHub) mediante **Auth0** (`@auth0/auth0-react`), garantizando que únicamente usuarios identificados puedan ingresar a las salas del chat universitario, mostrando su identidad (nombre, correo y avatar) y permitiendo cerrar sesión de forma segura tanto en desarrollo local como en producción sobre **Vercel**.

---

## 2. Criterios de Aceptación

1. **CA-01 (Configuración por Entorno):** La aplicación lee `VITE_AUTH0_DOMAIN` y `VITE_AUTH0_CLIENT_ID` desde `import.meta.env` (con soporte de inyección por props para pruebas automatizadas y aviso claro si faltan variables en desarrollo).
2. **CA-02 (Guardia de Acceso al Chat):** Cuando `isAuthenticated === false`, el área de mensajes y el formulario de envío de **UNA Chat** permanecen bloqueados y no se renderizan en el DOM; en su lugar se muestra una tarjeta institucional de bienvenida con el botón **"Iniciar sesión con Auth0 (Google / GitHub)"** que invoca `loginWithRedirect()`.
3. **CA-03 (Estado de Carga):** Mientras `isLoading === true`, se presenta un indicador accesible de verificación de sesión (`Verificando sesión segura con Auth0...`).
4. **CA-04 (Perfil de Usuario y Logout):** Cuando `isAuthenticated === true`, se muestra el encabezado de perfil con la foto/avatar del usuario (`user.picture`), nombre visible (`user.name` o `user.nickname`), correo electrónico (`user.email`) y el botón **"Cerrar sesión"** que invoca `logout({ logoutParams: { returnTo: window.location.origin } })`.
5. **CA-05 (Manejo de Errores y Cancelaciones):** Si Auth0 retorna un error (por ejemplo, el usuario cancela el consentimiento social produciendo `access_denied`, o falla la validación), se muestra una alerta explicativa en español con el detalle amigable y un botón **"Intentar de nuevo"** que permite relanzar `loginWithRedirect()`.

---

## 3. Arquitectura y Variables de Entorno

### Variables en `.env.example`

```ini
VITE_AUTH0_DOMAIN=tu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id_publico_de_auth0
VITE_AUTH0_CALLBACK_URL=http://localhost:5173
VITE_AUTH0_AUDIENCE=
```

### Estructura de Componentes en `src/`

- `src/config/auth0.ts`: Helper tipado que normaliza y valida la configuración de Auth0 (`domain`, `clientId`, `redirectUri`) y detecta errores de callback en la URL (`?error=...&error_description=...`).
- `src/components/LoginGate.tsx`: Pantalla institucional de bloqueo y bienvenida para usuarios no autenticados.
- `src/components/AuthErrorBanner.tsx`: Componente de alerta en español para errores de autenticación o cancelación de login social, con acción de reintento.
- `src/components/UserProfileBar.tsx`: Barra superior con avatar, nombre, correo, badge de estado conectado y botón de cierre de sesión (`logout`).
- `src/components/ChatRoom.tsx`: Sala de mensajería de **UNA Chat** accesible exclusivamente tras superar la guardia de autenticación, donde cada mensaje enviado lleva la firma del usuario autenticado.
- `src/App.tsx`: Orquestador principal que consume `useAuth0()` y aplica la guardia *fail-closed*.

---

## 4. Plan de Pruebas TDD (`src/__tests__/App.auth.test.tsx`)

1. **Test 1 (Red → Green): Bloqueo de usuarios no autenticados:** Verifica que cuando `isAuthenticated: false`, el chat no es visible y se muestra la invitación a iniciar sesión social; al hacer clic en el botón, se invoca `loginWithRedirect`.
2. **Test 2 (Red → Green): Estado de carga:** Verifica que mientras `isLoading: true`, se muestra el estado de carga y no se expone el chat.
3. **Test 3 (Red → Green): Acceso autenticado, perfil y envío de mensajes:** Verifica que cuando `isAuthenticated: true` con un usuario de prueba (`name`, `email`, `picture`), se renderiza su identidad en pantalla, se habilita la sala de chat de UNA Chat y se pueden publicar mensajes asociados a su nombre.
4. **Test 4 (Red → Green): Cierre de sesión (Logout):** Verifica que al pulsar el botón **"Cerrar sesión"**, se llama a `logout` con `logoutParams: { returnTo: window.location.origin }`.
5. **Test 5 (Red → Green): Cancelación o error de autenticación:** Verifica que cuando `error` está presente (ej. `access_denied: El usuario canceló el inicio de sesión`), se muestra la alerta comprensible en español y el botón **"Intentar de nuevo"** dispara `loginWithRedirect`.

