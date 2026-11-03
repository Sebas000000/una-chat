import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth0 } from '@auth0/auth0-react';
import App from '../App';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockedUseAuth0 = vi.mocked(useAuth0);

describe('US-01: Autenticación Social OAuth con Auth0 en UNA Chat (TDD Suite)', () => {
  const loginWithRedirectMock = vi.fn();
  const logoutMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CA-02: bloquea el acceso al chat cuando el usuario NO está autenticado y permite iniciar sesión', async () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      error: undefined,
      loginWithRedirect: loginWithRedirectMock,
      logout: logoutMock,
    } as unknown as ReturnType<typeof useAuth0>);

    render(<App />);

    // Verifica que la invitación a autenticarse es visible
    expect(
      screen.getByRole('heading', { name: /Identifícate para ingresar a UNA Chat/i })
    ).toBeInTheDocument();

    // Verifica que la sala de chat protegida NO está en el DOM
    expect(screen.queryByTestId('protected-chat-room')).not.toBeInTheDocument();

    // Dispara login social
    const loginBtn = screen.getByRole('button', {
      name: /Iniciar sesión con Auth0/i,
    });
    await userEvent.click(loginBtn);
    expect(loginWithRedirectMock).toHaveBeenCalledTimes(1);
  });

  it('CA-03: muestra indicador de carga mientras Auth0 verifica la sesión activa', () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: undefined,
      error: undefined,
      loginWithRedirect: loginWithRedirectMock,
      logout: logoutMock,
    } as unknown as ReturnType<typeof useAuth0>);

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(
      /Verificando sesión segura con Auth0/i
    );
    expect(screen.queryByTestId('protected-chat-room')).not.toBeInTheDocument();
  });

  it('CA-04: muestra perfil del usuario autenticado (nombre, correo, foto), desbloquea el chat y permite enviar mensajes', async () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        name: 'Sebastián Estudiante UNA',
        email: 'sebas@est.una.ac.cr',
        picture: 'https://example.com/avatar-sebas.png',
      },
      error: undefined,
      loginWithRedirect: loginWithRedirectMock,
      logout: logoutMock,
    } as unknown as ReturnType<typeof useAuth0>);

    render(<App />);

    // Perfil visible
    expect(screen.getByText('Sebastián Estudiante UNA')).toBeInTheDocument();
    expect(screen.getByText('sebas@est.una.ac.cr')).toBeInTheDocument();
    const avatar = screen.getByRole('img', { name: /Avatar de Sebastián Estudiante UNA/i });
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar-sebas.png');

    // Sala de chat desbloqueada
    expect(screen.getByTestId('protected-chat-room')).toBeInTheDocument();

    // Envío de mensaje asociado a la identidad autenticada
    const input = screen.getByPlaceholderText(/Escribe un mensaje para la sala general/i);
    await userEvent.type(input, 'Hola compañeros del Laboratorio 8!');
    const sendButton = screen.getByRole('button', { name: /Enviar mensaje/i });
    await userEvent.click(sendButton);

    expect(screen.getByText('Hola compañeros del Laboratorio 8!')).toBeInTheDocument();
  });

  it('CA-04: ejecuta logout redirigiendo al origin actual al hacer clic en Cerrar sesión', async () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        name: 'Sebastián Estudiante UNA',
        email: 'sebas@est.una.ac.cr',
      },
      error: undefined,
      loginWithRedirect: loginWithRedirectMock,
      logout: logoutMock,
    } as unknown as ReturnType<typeof useAuth0>);

    render(<App />);

    const logoutBtn = screen.getByRole('button', { name: /Cerrar sesión/i });
    await userEvent.click(logoutBtn);

    expect(logoutMock).toHaveBeenCalledWith({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  });

  it('CA-05: maneja errores o cancelación de login (access_denied) con mensaje comprensible en español y opción de reintentar', async () => {
    mockedUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      error: new Error('access_denied: User cancelled the login'),
      loginWithRedirect: loginWithRedirectMock,
      logout: logoutMock,
    } as unknown as ReturnType<typeof useAuth0>);

    render(<App />);

    const alertBox = screen.getByRole('alert');
    expect(alertBox).toHaveTextContent(/Inicio de sesión cancelado o interrumpido/i);
    expect(alertBox).toHaveTextContent(/Cancelaste la autorización en el proveedor social/i);

    const retryBtn = screen.getByRole('button', { name: /Intentar de nuevo/i });
    await userEvent.click(retryBtn);

    expect(loginWithRedirectMock).toHaveBeenCalledTimes(1);
  });
});

