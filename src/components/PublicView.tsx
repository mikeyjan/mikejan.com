/**
 * PublicView component for the public-facing website
 * Requirements: 1.1-5.10
 * 
 * This component:
 * - Integrates PersonalSection and CitiesSection
 * - Manages view mode and sort mode state
 * - Handles city selection and overlay display
 * - Fetches city details on selection
 * - Supports deep linking via /city/:cityId URL
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import PersonalSection from './PersonalSection';
import { CitiesSection } from './CitiesSection';
import { CityOverlay } from './CityOverlay';
import { City } from '../types';
import './PublicView.css';

const SLIDE_DURATION = 600; // ms, must match CSS transition

/** Convert city name to URL-friendly slug */
const toSlug = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const PublicView: React.FC = () => {
  const { personalInfo, cities, loading, error } = useData();
  const { citySlug } = useParams<{ citySlug?: string }>();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'tile' | 'map'>('tile');
  const [sortMode, setSortMode] = useState<'alphabetical' | 'date'>('date');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Handle deep link: open overlay if citySlug is in URL
  useEffect(() => {
    if (citySlug && cities.length > 0 && !selectedCity) {
      const city = cities.find(c => toSlug(c.name) === citySlug);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [citySlug, cities, selectedCity]);

  const handleViewModeChange = useCallback((mode: 'tile' | 'map') => setViewMode(mode), []);
  const handleSortModeChange = useCallback((mode: 'alphabetical' | 'date') => setSortMode(mode), []);
  
  const handleCitySelect = useCallback((city: City) => {
    setIsClosing(false);
    setSelectedCity(city);
    navigate(`/city/${toSlug(city.name)}`, { replace: true });
  }, [navigate]);

  const handleOverlayClose = useCallback(() => {
    setIsClosing(true);
    navigate('/', { replace: true });
    setTimeout(() => {
      setSelectedCity(null);
      setIsClosing(false);
    }, SLIDE_DURATION);
  }, [navigate]);

  // Show loading state
  if (loading && !personalInfo && cities.length === 0) {
    return (
      <div className="public-view">
        <div className="public-view-loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !personalInfo && cities.length === 0) {
    return (
      <div className="public-view">
        <div className="public-view-error">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-view">
      {/* Personal Section - Requirements: 1.1-1.5 */}
      {personalInfo && (
        <PersonalSection personalInfo={personalInfo} />
      )}

      {/* Cities Section - Requirements: 2.1-2.5, 4.1-4.6 */}
      <hr className="section-divider" aria-hidden="true" />
      <CitiesSection
        cities={cities}
        viewMode={viewMode}
        sortMode={sortMode}
        onViewModeChange={handleViewModeChange}
        onSortModeChange={handleSortModeChange}
        onCitySelect={handleCitySelect}
      />

      {/* City Overlay - Requirements: 5.1-5.10 */}
      {(selectedCity) && (
        <CityOverlay
          city={selectedCity}
          isClosing={isClosing}
          onClose={handleOverlayClose}
        />
      )}
    </div>
  );
};

export default PublicView;
