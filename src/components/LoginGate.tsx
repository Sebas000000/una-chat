import React from 'react';

interface LoginGateProps {
  onLogin: () => void;
  isConfigured?: boolean;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLogin, isConfigured = true }) => {
  return (
    <section className="login-gate-card" aria-labelledby="login-gate-heading">
      <div className="una-badge">Universidad Nacional · Campus Nicoya</div>
      <h1 id="login-gate-heading" className="login-gate-title">
        Identifícate para ingresar a UNA Chat
      </h1>
      <p className="login-gate-subtitle">
        Para proteger la integridad de las salas académicas, el acceso al chat requiere
        iniciar sesión mediante tu cuenta social verificada (Google o GitHub) con Auth0.
      </p>

      {!isConfigured && (
        <div className="config-warning" role="note">
          <strong>Configuración local pendiente:</strong> Define tus credenciales{' '}
          <code>VITE_AUTH0_DOMAIN</code> y <code>VITE_AUTH0_CLIENT_ID</code> en tu archivo{' '}
          <code>.env</code> (guíate con <code>.env.example</code>).
        </div>
      )}

      <div className="login-gate-actions">
        <button type="button" className="btn-primary btn-large" onClick={onLogin}>
          Iniciar sesión con Auth0 (Google / GitHub)
        </button>
      </div>

      <ul className="security-highlights">
        <li>Flujo seguro OAuth 2.0 + OIDC (PKCE) sin contraseñas almacenadas en el cliente</li>
        <li>Identidad universitaria visible en tiempo real (nombre y fotografía de perfil)</li>
        <li>Compatible con entorno local y despliegue en producción sobre Vercel</li>
      </ul>
    </section>
  );
};

