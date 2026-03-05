/**
 * Unit tests for AdminAuth component
 * Requirements: 6.1-6.3
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminAuth from './AdminAuth';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch for authentication
global.fetch = jest.fn();

describe('AdminAuth Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Component renders login form
   * Requirements: 6.1
   */
  it('renders login form with password field and submit button', () => {
    render(
      <AuthProvider>
        <AdminAuth />
      </AuthProvider>
    );

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  /**
   * Test: Submit button is disabled when password is empty
   * Requirements: 6.1
   */
  it('disables submit button when password is empty', () => {
    render(
      <AuthProvider>
        <AdminAuth />
      </AuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: Submit button is enabled when password is entered
   * Requirements: 6.1
   */
  it('enables submit button when password is entered', () => {
    render(
      <AuthProvider>
        <AdminAuth />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    expect(submitButton).not.toBeDisabled();
  });

  /**
   * Test: Displays loading state during authentication
   * Requirements: 6.1, 6.2
   */
  it('displays loading state during authentication', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ token: 'test-token', expiresAt: '2024-01-01T00:00:00Z' })
      }), 100))
    );

    render(
      <AuthProvider>
        <AdminAuth />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Authenticating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Authenticating...')).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Displays error message for invalid password
   * Requirements: 6.3
   */
  it('displays error message when authentication fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Invalid password' } })
    });

    render(
      <AuthProvider>
        <AdminAuth />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid password');
    });
  });

  /**
   * Test: Password input is disabled during authentication
   * Requirements: 6.1, 6.2
   */
  it('disables password input during authentication', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ token: 'test-token', expiresAt: '2024-01-01T00:00:00Z' })
      }), 100))
    );

    render(
      <AuthProvider>
        <AdminAuth />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(submitButton);

    expect(passwordInput).toBeDisabled();

    await waitFor(() => {
      expect(passwordInput).not.toBeDisabled();
    });
  });

  /**
   * Test: Handles successful authentication
   * Requirements: 6.2
   */
  it('handles successful authentication', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token', expiresAt: '2024-01-01T00:00:00Z' })
    });

    render(
      <AuthProvider>
        <AdminAuth />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: 'correctpassword' })
      });
    });
  });
});
