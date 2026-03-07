/**
 * MapView component for displaying cities as markers on a minimalist world map
 * Requirements: 2.4, 3.1-3.5
 * 
 * This component:
 * - Renders a minimalist world map using react-simple-maps
 * - Places markers at city coordinates
 * - Handles marker click events to open city overlays
 * - Implements touch gestures for mobile
 */

import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from '@vnedyalk0v/react19-simple-maps';
import { City } from '../types';
import geoData from '../countries-110m.json';
import './MapView.css';

/**
 * Props for MapView component
 */
interface MapViewProps {
  cities: City[];
  onCitySelect: (city: City) => void;
}

/**
 * MapView component
 * Requirements: 2.4, 3.1-3.5
 */
export const MapView: React.FC<MapViewProps> = ({ cities, onCitySelect }) => {
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  /**
   * Handle marker click
   * Requirements: 3.2, 5.2
   */
  const handleMarkerClick = (city: City) => {
    onCitySelect(city);
  };

  /**
   * Handle marker hover
   */
  const handleMarkerHover = (city: City, event: React.MouseEvent) => {
    const rect = (event.currentTarget as Element).closest('.map-view')?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    setHoveredCity(city);
  };

  const handleMarkerLeave = () => {
    setHoveredCity(null);
  };

  return (
    <div className="map-view">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [0, 20],
          scale: 147
        }}
        width={800}
        height={450}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          center={[0, 20]}
          zoom={1}
          minZoom={1}
          maxZoom={8}
        >
          {/* Render world map geography */}
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e5e7eb"
                  stroke="#d1d5db"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#d1d5db' },
                    pressed: { outline: 'none' }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Render city markers */}
          {cities.map((city) => (
            <Marker
              key={city.id}
              coordinates={[city.longitude, city.latitude]}
            >
              <circle
                r={6}
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth={2}
                className="city-marker"
                onClick={() => handleMarkerClick(city)}
                onMouseEnter={(e) => handleMarkerHover(city, e)}
                onMouseLeave={handleMarkerLeave}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`${city.name}, ${city.country}`}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      
      {/* City name tooltip */}
      {hoveredCity && (
        <div 
          className="map-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y
          }}
        >
          <span className="map-tooltip-name">{hoveredCity.name}</span>
          <span className="map-tooltip-country">{hoveredCity.country}</span>
        </div>
      )}
    </div>
  );
};
