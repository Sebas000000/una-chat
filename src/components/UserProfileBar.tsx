import React from 'react';

export interface AuthenticatedUserProfile {
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
}

interface UserProfileBarProps {
  user?: AuthenticatedUserProfile;
  onLogout: () => void;
}

export const UserProfileBar: React.FC<UserProfileBarProps> = ({ user, onLogout }) => {
  const displayName = user?.name || user?.nickname || user?.email || 'Usuario UNA';
  const displayEmail = user?.email || 'Sesión OAuth verificada';
  const avatarUrl =
    user?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=a6192e&color=fff`;

  return (
    <header className="user-profile-bar" data-testid="user-profile-bar">
      <div className="brand-block">
        <span className="brand-dot" aria-hidden="true" />
        <div>
          <strong className="brand-title">UNA Chat</strong>
          <span className="brand-subtitle">Sala Académica · Campus Nicoya</span>
        </div>
      </div>

      <div className="user-identity-block">
        <img
          src={avatarUrl}
          alt={`Avatar de ${displayName}`}
          className="user-avatar"
          referrerPolicy="no-referrer"
        />
        <div className="user-meta">
          <span className="user-name">{displayName}</span>
          <span className="user-email">{displayEmail}</span>
        </div>
        <button type="button" className="btn-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

