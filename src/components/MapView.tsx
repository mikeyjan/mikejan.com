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

import React from 'react';
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
  /**
   * Handle marker click
   * Requirements: 3.2, 5.2
   */
  const handleMarkerClick = (city: City) => {
    onCitySelect(city);
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
                  fill="#1e1e1e"
                  stroke="#2a2a2a"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#252525' },
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
                fill="#2dd4bf"
                stroke="#0a0a0a"
                strokeWidth={2}
                className="city-marker"
                onClick={() => handleMarkerClick(city)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`${city.name}, ${city.country}`}
              />
              <title>{city.name}, {city.country}</title>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};
