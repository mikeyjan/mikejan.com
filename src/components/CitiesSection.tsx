/**
 * CitiesSection component for displaying cities with view and sort controls
 * Requirements: 2.2-2.5
 * 
 * This component:
 * - Provides a toggle control to switch between Tile View and Map View
 * - Provides a sort control (visible only in Tile View)
 * - Delegates rendering to TileView or MapView based on current mode
 * - Handles city selection events
 */

import React from 'react';
import { City } from '../types';
import { TileView } from './TileView';
import { MapView } from './MapView';
import './CitiesSection.css';

/**
 * Props for CitiesSection component
 */
interface CitiesSectionProps {
  cities: City[];
  viewMode: 'tile' | 'map';
  sortMode: 'alphabetical' | 'date';
  onViewModeChange: (mode: 'tile' | 'map') => void;
  onSortModeChange: (mode: 'alphabetical' | 'date') => void;
  onCitySelect: (city: City) => void;
}

/**
 * CitiesSection component
 * Requirements: 2.2-2.5
 */
export const CitiesSection: React.FC<CitiesSectionProps> = ({
  cities,
  viewMode,
  sortMode,
  onViewModeChange,
  onSortModeChange,
  onCitySelect
}) => {
  return (
    <section className="cities-section">
      <div className="cities-section-header">
        <div className="cities-section-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Adventures
        </div>
        <h2 className="cities-section-title">Places I've Been</h2>
        <p className="cities-section-subtitle">
          {cities.length} {cities.length === 1 ? 'city' : 'cities'} across the world
        </p>
      </div>

      <div className="cities-controls">
        {/* View mode segmented control - Requirements: 2.2 */}
        <div className="view-mode-segmented" role="group" aria-label="View mode">
          <button
            className={`segment-btn${viewMode === 'tile' ? ' active' : ''}`}
            onClick={() => onViewModeChange('tile')}
            aria-label="Tile view"
            aria-pressed={viewMode === 'tile'}
          >
            ▦ Tiles
          </button>
          <button
            className={`segment-btn${viewMode === 'map' ? ' active' : ''}`}
            onClick={() => onViewModeChange('map')}
            aria-label="Map view"
            aria-pressed={viewMode === 'map'}
          >
            ◎ Map
          </button>
        </div>

        {/* Sort mode toggle - Only visible in tile view - Requirements: 4.2 */}
        {viewMode === 'tile' && (
          <div className="view-mode-segmented" role="group" aria-label="Sort order">
            <button
              className={`segment-btn${sortMode === 'date' ? ' active' : ''}`}
              onClick={() => onSortModeChange('date')}
              aria-label="Sort by most recent"
              aria-pressed={sortMode === 'date'}
            >
              Recent
            </button>
            <button
              className={`segment-btn${sortMode === 'alphabetical' ? ' active' : ''}`}
              onClick={() => onSortModeChange('alphabetical')}
              aria-label="Sort alphabetically"
              aria-pressed={sortMode === 'alphabetical'}
            >
              A → Z
            </button>
          </div>
        )}
      </div>

      {/* Delegate to appropriate view component - Requirements: 2.3, 2.4 */}
      <div className="cities-content">
        {viewMode === 'tile' ? (
          <TileView
            cities={cities}
            sortMode={sortMode}
            onCitySelect={onCitySelect}
          />
        ) : (
          <MapView
            cities={cities}
            onCitySelect={onCitySelect}
          />
        )}
      </div>
    </section>
  );
};
