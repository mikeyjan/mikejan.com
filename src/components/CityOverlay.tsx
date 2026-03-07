/**
 * CityOverlay component for displaying detailed city information
 * Requirements: 5.1-5.10
 * 
 * This component:
 * - Displays city name and Google Map link
 * - Displays dates visited
 * - Displays "Before you go" section
 * - Displays "Overview" section
 * - Displays "Places to visit" with 5 category subsections
 * - Adapts layout based on view mode (full overlay for tile, side panel for map)
 * - Shows loading state during fetch
 * - Handles close events
 */

import React, { useEffect, useState } from 'react';
import { City } from '../types';
import { useData } from '../contexts/DataContext';
import './CityOverlay.css';

/**
 * Props for CityOverlay component
 */
interface CityOverlayProps {
  city: City;
  isClosing?: boolean;
  onClose: () => void;
}

/**
 * CityOverlay component
 * Requirements: 5.1-5.10
 */
export const CityOverlay: React.FC<CityOverlayProps> = ({ city, isClosing = false, onClose }) => {
  const { getCityDetails } = useData();
  const [cityDetails, setCityDetails] = useState<City | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch city details on mount
   * Requirements: 5.1-5.10
   */
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const details = await getCityDetails(city.id);
        setCityDetails(details);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load city details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [city.id, getCityDetails]);

  /**
   * Handle escape key press
   * Requirements: 5.10
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  /**
   * Format dates visited for display
   * Requirements: 5.6
   * Note: Dates are stored as human-readable strings (e.g., "February, 2026")
   */
  const formatDatesVisited = (dates: string[]): string => {
    if (!dates || dates.length === 0) {
      return 'No dates recorded';
    }
    
    // Dates are already stored in human-readable format, just join them
    return dates.join(', ');
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className={`city-overlay overlay-sidepanel${isClosing ? ' closing' : ''}`}>
        <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
        <div className="overlay-content">
          <div className="overlay-loading">
            <div className="loading-spinner"></div>
            <p>Loading city details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cityDetails) {
    return (
      <div className={`city-overlay overlay-sidepanel${isClosing ? ' closing' : ''}`}>
        <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
        <div className="overlay-content">
          <button className="overlay-close" onClick={onClose} aria-label="Close overlay">
            ✕
          </button>
          <div className="overlay-error">
            <p>{error || 'Failed to load city details'}</p>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render city details
   * Requirements: 5.4-5.9
   */
  return (
    <div className={`city-overlay overlay-sidepanel${isClosing ? ' closing' : ''}`}>
      {/* Backdrop - click to close */}
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="overlay-content">
        {/* Close button - Requirements: 5.10 */}
        <button className="overlay-close" onClick={onClose} aria-label="Close overlay">
          ✕
        </button>

        {/* City header - Requirements: 5.4, 5.5 */}
        <header className="overlay-header">
          <h1 className="overlay-city-name">{cityDetails.name}</h1>
          {cityDetails.googleMapLink && (
            <a 
              href={cityDetails.googleMapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="overlay-map-link"
            >
              Custom Google Map
            </a>
          )}
        </header>

        {/* Dates visited - Requirements: 5.6 */}
        <section className="overlay-section">
          <h2 className="overlay-section-title">Dates Visited</h2>
          <p className="overlay-dates">{formatDatesVisited(cityDetails.datesVisited)}</p>
        </section>

        {/* Overview section - Requirements: 5.8 */}
        {cityDetails.overview && (
          <section className="overlay-section">
            <h2 className="overlay-section-title">Overview</h2>
            <div className="overlay-section-content">
              {cityDetails.overview}
            </div>
          </section>
        )}

        {/* Before you go section - Requirements: 5.7 */}
        {cityDetails.beforeYouGo && (
          <section className="overlay-section">
            <h2 className="overlay-section-title">Before You Go</h2>
            <div className="overlay-section-content">
              {cityDetails.beforeYouGo}
            </div>
          </section>
        )}

        {/* Places to visit section - Requirements: 5.9 */}
        <section className="overlay-section">
          <h2 className="overlay-section-title">Places to Visit</h2>
          
          {/* Bars */}
          {cityDetails.places.bars?.length > 0 && (
            <div className="overlay-category overlay-category-bars">
              <h3 className="overlay-category-title">BARS</h3>
              {cityDetails.places.bars.map((place, i) => (
                <div key={i} className="overlay-place-item">
                  {place.link
                    ? <a href={place.link} target="_blank" rel="noopener noreferrer" className="overlay-place-title">{place.title}</a>
                    : <span className="overlay-place-title">{place.title}</span>}
                  {place.notes && <p className="overlay-place-notes">{place.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Restaurants */}
          {cityDetails.places.restaurants?.length > 0 && (
            <div className="overlay-category overlay-category-restaurants">
              <h3 className="overlay-category-title">RESTAURANTS</h3>
              {cityDetails.places.restaurants.map((place, i) => (
                <div key={i} className="overlay-place-item">
                  {place.link
                    ? <a href={place.link} target="_blank" rel="noopener noreferrer" className="overlay-place-title">{place.title}</a>
                    : <span className="overlay-place-title">{place.title}</span>}
                  {place.notes && <p className="overlay-place-notes">{place.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Points of Interest */}
          {cityDetails.places.pointsOfInterest?.length > 0 && (
            <div className="overlay-category overlay-category-poi">
              <h3 className="overlay-category-title">POINTS OF INTEREST</h3>
              {cityDetails.places.pointsOfInterest.map((place, i) => (
                <div key={i} className="overlay-place-item">
                  {place.link
                    ? <a href={place.link} target="_blank" rel="noopener noreferrer" className="overlay-place-title">{place.title}</a>
                    : <span className="overlay-place-title">{place.title}</span>}
                  {place.notes && <p className="overlay-place-notes">{place.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Gyms */}
          {cityDetails.places.gyms?.length > 0 && (
            <div className="overlay-category overlay-category-gyms">
              <h3 className="overlay-category-title">GYMS</h3>
              {cityDetails.places.gyms.map((place, i) => (
                <div key={i} className="overlay-place-item">
                  {place.link
                    ? <a href={place.link} target="_blank" rel="noopener noreferrer" className="overlay-place-title">{place.title}</a>
                    : <span className="overlay-place-title">{place.title}</span>}
                  {place.notes && <p className="overlay-place-notes">{place.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Accommodations */}
          {cityDetails.places.accommodations?.length > 0 && (
            <div className="overlay-category overlay-category-accommodations">
              <h3 className="overlay-category-title">ACCOMMODATIONS</h3>
              {cityDetails.places.accommodations.map((place, i) => (
                <div key={i} className="overlay-place-item">
                  {place.link
                    ? <a href={place.link} target="_blank" rel="noopener noreferrer" className="overlay-place-title">{place.title}</a>
                    : <span className="overlay-place-title">{place.title}</span>}
                  {place.notes && <p className="overlay-place-notes">{place.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
