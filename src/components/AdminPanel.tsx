/**
 * AdminPanel component for managing website content
 * Requirements: 7.1-9.7
 * 
 * This component:
 * - Integrates PersonalInfoForm, CityList, CityForm components
 * - Handles navigation between different admin views
 * - Manages city creation, editing, and deletion workflows
 * - Provides a cohesive admin interface
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PersonalInfoForm from './PersonalInfoForm';
import CityList from './CityList';
import CityForm from './CityForm';
import PlacesUpload from './PlacesUpload';
import { DeleteConfirmation } from './DeleteConfirmation';
import { City } from '../types';
import './AdminPanel.css';

/**
 * Admin view types
 */
type AdminView = 'dashboard' | 'editCity' | 'createCity';

/**
 * AdminPanel component
 * Requirements: 7.1-9.7
 */
export const AdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const { deleteCity } = useData();
  
  // View state
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPersonalInfoExpanded, setIsPersonalInfoExpanded] = useState(false);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * Handle create city button click
   * Requirements: 8.2
   */
  const handleCreateCity = () => {
    setEditingCity(null);
    setCurrentView('createCity');
  };

  /**
   * Handle edit city button click
   * Requirements: 8.4
   */
  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCurrentView('editCity');
  };

  /**
   * Handle delete city button click
   * Requirements: 8.6
   */
  const handleDeleteCity = (city: City) => {
    setCityToDelete(city);
  };

  /**
   * Handle delete confirmation
   * Requirements: 8.7
   */
  const handleConfirmDelete = async () => {
    if (!cityToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCity(cityToDelete.id);
      setCityToDelete(null);
    } catch (error) {
      console.error('Failed to delete city:', error);
      // Error is handled by DataContext
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle cancel delete
   * Requirements: 8.6
   */
  const handleCancelDelete = () => {
    if (!isDeleting) {
      setCityToDelete(null);
    }
  };

  /**
   * Handle city form success
   * Requirements: 8.3, 8.5
   */
  const handleCityFormSuccess = () => {
    setCurrentView('dashboard');
    setEditingCity(null);
  };

  /**
   * Handle city form cancel
   * Requirements: 8.2
   */
  const handleCityFormCancel = () => {
    setCurrentView('dashboard');
    setEditingCity(null);
  };

  /**
   * Render dashboard view
   */
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <section className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Quick Upload</h2>
        </div>
        <div className="admin-section-content">
          <PlacesUpload />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Cities</h2>
          <button
            onClick={handleCreateCity}
            className="admin-button admin-button-primary"
          >
            Add New City
          </button>
        </div>
        <CityList
          onAddCity={handleCreateCity}
          onEditCity={handleEditCity}
          onDeleteCity={handleDeleteCity}
        />
      </section>

      <section className="admin-section admin-section-collapsible">
        <button
          className="admin-section-header admin-section-toggle"
          onClick={() => setIsPersonalInfoExpanded(!isPersonalInfoExpanded)}
          aria-expanded={isPersonalInfoExpanded}
        >
          <h2 className="admin-section-title">Personal Information</h2>
          <span className={`admin-section-chevron ${isPersonalInfoExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        {isPersonalInfoExpanded && (
          <div className="admin-section-content">
            <PersonalInfoForm />
          </div>
        )}
      </section>
    </div>
  );

  /**
   * Render create city view
   */
  const renderCreateCity = () => (
    <div className="admin-form-view">
      <button
        onClick={() => setCurrentView('dashboard')}
        className="admin-back-button"
      >
        ← Back to Dashboard
      </button>
      <CityForm
        onSuccess={handleCityFormSuccess}
        onCancel={handleCityFormCancel}
      />
    </div>
  );

  /**
   * Render edit city view
   */
  const renderEditCity = () => (
    <div className="admin-form-view">
      <button
        onClick={() => setCurrentView('dashboard')}
        className="admin-back-button"
      >
        ← Back to Dashboard
      </button>
      <CityForm
        city={editingCity || undefined}
        onSuccess={handleCityFormSuccess}
        onCancel={handleCityFormCancel}
      />
    </div>
  );

  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="admin-button admin-button-secondary"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="admin-content">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'createCity' && renderCreateCity()}
        {currentView === 'editCity' && renderEditCity()}
      </main>

      {/* Delete confirmation dialog */}
      {cityToDelete && (
        <DeleteConfirmation
          cityName={cityToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminPanel;
