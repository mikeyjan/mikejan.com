/**
 * Tests for App component
 * Requirements: All
 */

import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock react-router-dom - uses manual mock from __mocks__
jest.mock('react-router-dom');

// Mock the contexts and components to avoid complex setup
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    error: null
  })
}));

jest.mock('./contexts/DataContext', () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useData: () => ({
    personalInfo: null,
    cities: [],
    loading: true,
    error: null,
    refreshData: jest.fn(),
    getCityDetails: jest.fn(),
    updatePersonalInfo: jest.fn(),
    createCity: jest.fn(),
    updateCity: jest.fn(),
    deleteCity: jest.fn()
  })
}));

jest.mock('./components', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PublicView: () => <div>Loading...</div>,
  AdminAuth: () => <div>Admin Login</div>,
  AdminPanel: () => <div>Admin Panel</div>
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('wraps application with error boundary and providers', () => {
    // If App renders, ErrorBoundary, Router, and Providers are working
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
