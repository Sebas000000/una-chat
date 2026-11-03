import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { formatAuthErrorToSpanish, getAuth0EnvConfig } from './config/auth0';
import { AuthErrorBanner } from './components/AuthErrorBanner';
import { LoginGate } from './components/LoginGate';
import { UserProfileBar } from './components/UserProfileBar';
import { ChatRoom } from './components/ChatRoom';
import './App.css';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, user, error, loginWithRedirect, logout } = useAuth0();
  const [errorDismissed, setErrorDismissed] = useState(false);

  const envConfig = getAuth0EnvConfig();
  const formattedError = !errorDismissed ? formatAuthErrorToSpanish(error) : null;

  const handleLogin = () => {
    setErrorDismissed(false);
    void loginWithRedirect();
  };

  const handleLogout = () => {
    void logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="app-shell app-centered">
        <div className="loading-card" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p>Verificando sesión segura con Auth0...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {formattedError && (
        <AuthErrorBanner
          title={formattedError.title}
          description={formattedError.description}
          code={formattedError.code}
          onRetry={handleLogin}
          onDismiss={() => setErrorDismissed(true)}
        />
      )}

      {!isAuthenticated ? (
        <LoginGate onLogin={handleLogin} isConfigured={envConfig.isConfigured} />
      ) : (
        <div className="authenticated-workspace">
          <UserProfileBar user={user} onLogout={handleLogout} />
          <ChatRoom user={user} />
        </div>
      )}
    </div>
  );
};

export default App;

