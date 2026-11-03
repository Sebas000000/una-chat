import React, { useState } from 'react';
import type { AuthenticatedUserProfile } from './UserProfileBar';

export interface ChatMessage {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

interface ChatRoomProps {
  user?: AuthenticatedUserProfile;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    authorName: 'Sistema UNA Chat',
    authorEmail: 'paradigmas@una.ac.cr',
    text: '¡Bienvenido a la sala protegida del Laboratorio 8! Tu identidad social ha sido verificada mediante Auth0.',
    timestamp: '08:30',
  },
];

export const ChatRoom: React.FC<ChatRoomProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  const displayName = user?.name || user?.nickname || user?.email || 'Usuario Autenticado';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorName: displayName,
      authorEmail: user?.email,
      authorAvatar: user?.picture,
      text: trimmed,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
  };

  return (
    <main className="chat-room-container" data-testid="protected-chat-room">
      <div className="chat-messages-list" role="log" aria-live="polite">
        {messages.map((msg) => (
          <article key={msg.id} className="chat-message-item">
            <div className="chat-message-header">
              <strong className="chat-message-author">{msg.authorName}</strong>
              {msg.authorEmail && (
                <span className="chat-message-email">({msg.authorEmail})</span>
              )}
              <time className="chat-message-time">{msg.timestamp}</time>
            </div>
            <p className="chat-message-text">{msg.text}</p>
          </article>
        ))}
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-text-input"
          placeholder="Escribe un mensaje para la sala general..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Mensaje para la sala general"
        />
        <button type="submit" className="btn-primary">
          Enviar mensaje
        </button>
      </form>
    </main>
  );
};

