/**
 * Unit tests for AuthContext
 * Requirements: 6.1-6.5
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminAuthResponse } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  /**
   * Test: useAuth hook throws error when used outside provider
   */
  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  /**
   * Test: Initial authentication state
   * Requirements: 6.1, 6.4
   */
  it('should initialize with unauthenticated state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Successful login
   * Requirements: 6.2, 6.4
   */
  it('should authenticate successfully with valid password', async () => {
    const mockToken = 'mock-jwt-token-12345';
    const mockResponse: AdminAuthResponse = {
      token: mockToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Perform login
    await act(async () => {
      await result.current.login('correct-password');
    });

    // Verify authentication state
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.error).toBeNull();

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: 'correct-password' })
    });
  });

  /**
   * Test: Failed login with invalid password
   * Requirements: 6.3
   */
  it('should reject authentication with invalid password', async () => {
    const mockErrorResponse = {
      error: {
        message: 'Invalid password'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => mockErrorResponse
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Attempt login with invalid password
    await act(async () => {
      try {
        await result.current.login('wrong-password');
      } catch (error) {
        // Expected to throw
      }
    });

    // Verify authentication state remains unauthenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Invalid password');
  });

  /**
   * Test: Failed login with network error
   * Requirements: 6.3
   */
  it('should handle network errors during login', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Attempt login with network error
    await act(async () => {
      try {
        await result.current.login('any-password');
      } catch (error) {
        // Expected to throw
      }
    });

    // Verify authentication state remains unauthenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  /**
   * Test: Logout functionality
   * Requirements: 6.5
   */
  it('should revoke access on logout', async () => {
    const mockToken = 'mock-jwt-token-12345';
    const mockResponse: AdminAuthResponse = {
      token: mockToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // First login
    await act(async () => {
      await result.current.login('correct-password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockToken);

    // Then logout
    act(() => {
      result.current.logout();
    });

    // Verify authentication state is cleared
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Token stored in memory only (not localStorage)
   * Requirements: 6.4
   */
  it('should store token in memory only, not in localStorage', async () => {
    const mockToken = 'mock-jwt-token-12345';
    const mockResponse: AdminAuthResponse = {
      token: mockToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    // Spy on localStorage
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Perform login
    await act(async () => {
      await result.current.login('correct-password');
    });

    // Verify token is in memory
    expect(result.current.token).toBe(mockToken);

    // Verify localStorage was NOT used
    expect(setItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  /**
   * Test: Error state is cleared on successful login
   * Requirements: 6.2, 6.3
   */
  it('should clear error state on successful login after failed attempt', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // First attempt - fail
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid password' } })
    });

    await act(async () => {
      try {
        await result.current.login('wrong-password');
      } catch (error) {
        // Expected
      }
    });

    expect(result.current.error).toBe('Invalid password');

    // Second attempt - success
    const mockToken = 'mock-jwt-token-12345';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: mockToken,
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      })
    });

    await act(async () => {
      await result.current.login('correct-password');
    });

    // Verify error is cleared
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(mockToken);
  });

  /**
   * Test: Multiple login attempts maintain correct state
   * Requirements: 6.2, 6.4
   */
  it('should handle multiple login attempts correctly', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // First login
    const token1 = 'token-1';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: token1,
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      })
    });

    await act(async () => {
      await result.current.login('password1');
    });

    expect(result.current.token).toBe(token1);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();

    // Second login with different token
    const token2 = 'token-2';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: token2,
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      })
    });

    await act(async () => {
      await result.current.login('password2');
    });

    expect(result.current.token).toBe(token2);
  });
});
