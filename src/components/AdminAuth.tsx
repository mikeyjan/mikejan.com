/**
 * AdminAuth component for admin authentication
 * Requirements: 6.1-6.3
 * 
 * This component provides a login form for admin authentication:
 * - Renders password input field and submit button
 * - Uses the login function from AuthContext
 * - Displays loading state during authentication
 * - Shows error messages for failed authentication
 * - Redirects or signals successful authentication
 */

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AdminAuth.css';

/**
 * AdminAuth component
 * Requirements: 6.1-6.3
 */
const AdminAuth: React.FC = () => {
  const { login, error: authError } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submission
   * Requirements: 6.1-6.3
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!password.trim()) {
      return;
    }

    setLoading(true);

    try {
      await login(password);
      // On success, authentication state will update and parent component will handle redirect
    } catch (err) {
      // Error is already handled by AuthContext and stored in authError
      // Just reset loading state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth-container">
        <h1 className="admin-auth-title">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="admin-auth-field">
            <label htmlFor="password" className="admin-auth-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="admin-auth-input"
              placeholder="Enter admin password"
              autoComplete="current-password"
              autoFocus
            />
          </div>

          {authError && (
            <div className="admin-auth-error" role="alert">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="admin-auth-button"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
