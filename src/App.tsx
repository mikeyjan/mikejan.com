/**
 * Main App component with routing
 * Requirements: All
 * 
 * This component:
 * - Sets up routing between public view and admin panel
 * - Wraps the application with AuthContext and DataContext providers
 * - Handles initial data loading through DataContext
 * - Provides error boundary for graceful error handling
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useAuth } from './contexts/AuthContext';
import { ErrorBoundary, PublicView, AdminAuth, AdminPanel } from './components';
import './App.css';

/**
 * ProtectedRoute component for admin routes
 * Requirements: 6.1-6.5
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AdminAuth />;
  }
  
  return <>{children}</>;
};

/**
 * AppRoutes component - contains routing logic
 * Separated to allow access to AuthContext
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public view route - Requirements: 1.1-5.10 */}
      <Route path="/" element={<PublicView />} />
      
      {/* City deep link route */}
      <Route path="/city/:citySlug" element={<PublicView />} />
      
      {/* Admin panel route - Requirements: 6.1-9.7 */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Main App component
 * Requirements: All
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
