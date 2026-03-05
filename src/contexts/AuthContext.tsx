/**
 * AuthContext for managing authentication state
 * Requirements: 6.1-6.5
 * 
 * This context provides authentication functionality including:
 * - Login with password authentication
 * - Logout to revoke access
 * - Token management (stored in memory only, not localStorage)
 * - Authentication state tracking
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AdminAuthRequest, AdminAuthResponse } from '../types';

/**
 * Authentication context value interface
 * Requirements: 6.1-6.5
 */
interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  login: (password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application and provides authentication state
 * Requirements: 6.1-6.5
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Store token in memory only (not localStorage) as per requirements
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive authentication state from token presence
  const isAuthenticated = token !== null;

  /**
   * Login function - authenticates admin with password
   * Requirements: 6.1-6.3
   * 
   * @param password - Admin password
   * @throws Error if authentication fails
   */
  const login = useCallback(async (password: string): Promise<void> => {
    setError(null);

    try {
      // Prepare authentication request
      const requestBody: AdminAuthRequest = {
        password
      };

      // Call authentication endpoint
      // Note: API endpoint will be configured via Amplify
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // Handle authentication failure
        // Requirements: 6.3 - Display error message for invalid password
        const errorData = await response.json().catch(() => ({ error: { message: 'Authentication failed' } }));
        const errorMessage = errorData.error?.message || 'Invalid password';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Parse successful authentication response
      const data: AdminAuthResponse = await response.json();

      // Store token in memory
      // Requirements: 6.2, 6.4 - Grant access and maintain authentication state
      setToken(data.token);
      setError(null);

    } catch (err) {
      // Handle network or other errors
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Logout function - revokes admin access
   * Requirements: 6.5
   */
  const logout = useCallback((): void => {
    // Clear token from memory
    setToken(null);
    setError(null);
  }, []);

  // Provide authentication context to children
  const value: AuthContextValue = {
    isAuthenticated,
    token,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * @returns AuthContextValue
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
