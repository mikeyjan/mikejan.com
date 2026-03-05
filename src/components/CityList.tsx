/**
 * CityList component for admin city management
 * Requirements: 8.1, 8.2
 * 
 * This component displays all cities with management controls:
 * - Displays all cities from DataContext
 * - Renders each city with edit and delete buttons
 * - Provides an "Add City" button
 * - Handles click events to trigger edit/delete/add actions
 * - Shows loading state while fetching cities
 */

import React from 'react';
import { useData } from '../contexts/DataContext';
import { City } from '../types';
import './CityList.css';

/**
 * Props for CityList component
 */
interface CityListProps {
  onAddCity: () => void;
  onEditCity: (city: City) => void;
  onDeleteCity: (city: City) => void;
}

/**
 * CityList component
 * Requirements: 8.1, 8.2
 */
const CityList: React.FC<CityListProps> = ({ onAddCity, onEditCity, onDeleteCity }) => {
  const { cities, loading } = useData();

  /**
   * Handle edit button click
   * Requirements: 8.4
   */
  const handleEdit = (city: City) => {
    onEditCity(city);
  };

  /**
   * Handle delete button click
   * Requirements: 8.6, 8.7
   */
  const handleDelete = (city: City) => {
    onDeleteCity(city);
  };

  return (
    <div className="city-list">
      <div className="city-list-header">
        <h2 className="city-list-title">Manage Cities</h2>
        <button
          onClick={onAddCity}
          className="city-list-add-button"
          disabled={loading}
        >
          Add City
        </button>
      </div>

      {loading ? (
        <div className="city-list-loading">Loading cities...</div>
      ) : cities.length === 0 ? (
        <div className="city-list-empty">
          No cities yet. Click "Add City" to create your first city entry.
        </div>
      ) : (
        <div className="city-list-content">
          {cities.map((city) => (
            <div key={city.id} className="city-list-card">
              <div className="city-list-card-header">
                <div className="city-list-card-info">
                  <h3 className="city-list-card-name">{city.name}</h3>
                  <p className="city-list-card-country">{city.country}</p>
                  <div className="city-list-card-dates">
                    {city.datesVisited && city.datesVisited.length > 0
                      ? city.datesVisited.join(', ')
                      : 'No dates'}
                  </div>
                </div>
                <div className="city-list-actions">
                  <button
                    onClick={() => handleEdit(city)}
                    className="city-list-edit-button"
                    disabled={loading}
                    aria-label={`Edit ${city.name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(city)}
                    className="city-list-delete-button"
                    disabled={loading}
                    aria-label={`Delete ${city.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityList;
