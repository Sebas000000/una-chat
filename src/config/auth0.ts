export interface Auth0EnvConfig {
  domain: string;
  clientId: string;
  callbackUrl: string;
  audience?: string;
  isConfigured: boolean;
}

const PLACEHOLDER_DOMAINS = ['tu-tenant.us.auth0.com', 'your-tenant.auth0.com', ''];
const PLACEHOLDER_CLIENTS = ['tu_client_id_publico_de_auth0', 'your-client-id', ''];

export function getAuth0EnvConfig(): Auth0EnvConfig {
  const rawDomain = (import.meta.env.VITE_AUTH0_DOMAIN ?? '').trim();
  const domain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const clientId = (import.meta.env.VITE_AUTH0_CLIENT_ID ?? '').trim();
  const callbackUrl =
    (import.meta.env.VITE_AUTH0_CALLBACK_URL ?? '').trim() || window.location.origin;
  const audience = (import.meta.env.VITE_AUTH0_AUDIENCE ?? '').trim() || undefined;

  const isConfigured =
    Boolean(domain) &&
    Boolean(clientId) &&
    !PLACEHOLDER_DOMAINS.includes(domain) &&
    !PLACEHOLDER_CLIENTS.includes(clientId);

  return {
    domain,
    clientId,
    callbackUrl,
    audience,
    isConfigured,
  };
}

export function formatAuthErrorToSpanish(error?: Error | null): {
  title: string;
  description: string;
  code?: string;
} | null {
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get('error');
  const urlErrorDescription = urlParams.get('error_description');

  if (!error && !urlError) {
    return null;
  }

  const rawMessage = error?.message || `${urlError ?? ''}: ${urlErrorDescription ?? ''}`;
  const isAccessDenied =
    /access_denied|cancel|consent_required/i.test(rawMessage) ||
    urlError === 'access_denied';

  if (isAccessDenied) {
    return {
      title: 'Inicio de sesión cancelado o interrumpido',
      description:
        'Cancelaste la autorización en el proveedor social (Google / GitHub) o denegaste los permisos solicitados. Puedes volver a intentarlo cuando gustes.',
      code: 'access_denied',
    };
  }

  return {
    title: 'No se pudo completar la autenticación con Auth0',
    description:
      urlErrorDescription ||
      error?.message ||
      'Ocurrió un inconveniente al comunicarse con el proveedor de identidad. Verifica tu conexión o la configuración de Callback URLs.',
    code: urlError || 'auth_error',
  };
}

