import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import { getAuth0EnvConfig } from './config/auth0';

const auth0Config = getAuth0EnvConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.callbackUrl,
        ...(auth0Config.audience ? { audience: auth0Config.audience } : {}),
      }}
      cacheLocation="memory"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

