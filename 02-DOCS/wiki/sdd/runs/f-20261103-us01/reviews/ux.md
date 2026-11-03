# UX Review Report — US-01 (Auth0 Social Auth)

- **Reviewer Role:** `ux` (UX Reviewer)
- **Run ID:** `f-20261103-us01`
- **Verdict:** **PASS**

## Hallazgos de Experiencia de Usuario (UX)

1. **Claridad en el Bloqueo No Autenticado (`LoginGate`):**
   - El usuario comprende de inmediato por qué no puede ver el chat y qué proveedores sociales (Google / GitHub) puede emplear para identificarse.
   - Si el desarrollador olvida configurar `.env`, se muestra una nota orientativa indicando qué variables (`VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`) debe copiar desde `.env.example`.
2. **Manejo Empático de Cancelaciones y Errores en Español (`AuthErrorBanner`):**
   - `formatAuthErrorToSpanish()` en `src/config/auth0.ts` traduce códigos áridos de OAuth (`access_denied`, `consent_required` o parámetros `?error=...` en la URL) a mensajes claros en español: *"Inicio de sesión cancelado o interrumpido"*.
   - Incluye un botón primario **"Intentar de nuevo"** que limpia el estado de descarte y relanza `loginWithRedirect()`, además de un botón secundario **"Ocultar aviso"**.
3. **Transición de Estado de Carga (`isLoading`):**
   - Durante el intercambio del código OAuth tras el redirect de Auth0, se muestra un estado accesible (`role="status"`, `aria-live="polite"`) con el texto *"Verificando sesión segura con Auth0..."*, evitando parpadeos de pantalla.
4. **Cierre de Sesión Predecible:**
   - El botón **"Cerrar sesión"** redirige limpiamente a `window.location.origin`, funcionando sin cambios tanto en `http://localhost:5173` como en el dominio `.vercel.app`.

