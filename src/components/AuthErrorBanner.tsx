import React from 'react';

interface AuthErrorBannerProps {
  title: string;
  description: string;
  code?: string;
  onRetry: () => void;
  onDismiss?: () => void;
}

export const AuthErrorBanner: React.FC<AuthErrorBannerProps> = ({
  title,
  description,
  code,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="auth-error-banner" role="alert" aria-live="assertive">
      <div className="auth-error-header">
        <span className="auth-error-badge">Aviso de Autenticación</span>
        {code && <code className="auth-error-code">{code}</code>}
      </div>
      <h2 className="auth-error-title">{title}</h2>
      <p className="auth-error-description">{description}</p>
      <div className="auth-error-actions">
        <button type="button" className="btn-primary" onClick={onRetry}>
          Intentar de nuevo
        </button>
        {onDismiss && (
          <button type="button" className="btn-secondary" onClick={onDismiss}>
            Ocultar aviso
          </button>
        )}
      </div>
    </div>
  );
};

