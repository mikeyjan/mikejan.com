/**
 * TileView component for displaying cities as tiles grouped by country
 * Requirements: 2.3, 4.1-4.6
 * 
 * This component:
 * - Groups cities by country
 * - Sorts countries alphabetically or by most recent visit date
 * - Renders city tiles in a responsive grid layout
 * - Handles tile click events to open city overlays
 */

import React, { useMemo } from 'react';
import { City } from '../types';
import './TileView.css';

/**
 * Props for TileView component
 */
interface TileViewProps {
  cities: City[];
  sortMode: 'alphabetical' | 'date';
  onCitySelect: (city: City) => void;
}

/**
 * Group cities by country
 * Requirements: 4.1
 * 
 * @param cities - Array of cities to group
 * @returns Map of country name to array of cities
 */
const groupCitiesByCountry = (cities: City[]): Map<string, City[]> => {
  const grouped = new Map<string, City[]>();
  
  cities.forEach(city => {
    const existing = grouped.get(city.country) || [];
    grouped.set(city.country, [...existing, city]);
  });
  
  return grouped;
};

/**
 * Get the most recent date from a city's datesVisited array
 * Requirements: 4.4
 * 
 * @param city - City to get most recent date from
 * @returns Most recent date as Date object
 */
const getMostRecentDate = (city: City): Date => {
  if (!city.datesVisited || city.datesVisited.length === 0) {
    return new Date(0);
  }
  const maxTs = Math.max(...city.datesVisited.map(d => new Date(d).getTime()));
  return new Date(maxTs);
};

/**
 * Sort countries alphabetically
 * Requirements: 4.3
 * 
 * @param countries - Array of country names
 * @returns Sorted array of country names
 */
const sortCountriesAlphabetically = (countries: string[]): string[] => {
  return [...countries].sort((a, b) => a.localeCompare(b));
};

/**
 * Sort countries by most recent visit date
 * Requirements: 4.4
 * 
 * @param countryToCities - Map of country to cities
 * @returns Sorted array of country names
 */
const sortCountriesByMostRecent = (countryToCities: Map<string, City[]>): string[] => {
  const countriesWithDates = Array.from(countryToCities.entries()).map(([country, cities]) => {
    // Find the most recent date across all cities in this country
    const mostRecentDate = cities.reduce((latest, city) => {
      const cityDate = getMostRecentDate(city);
      return cityDate > latest ? cityDate : latest;
    }, new Date(0));
    
    return { country, mostRecentDate };
  });
  
  // Sort by date descending (most recent first)
  countriesWithDates.sort((a, b) => b.mostRecentDate.getTime() - a.mostRecentDate.getTime());
  
  return countriesWithDates.map(item => item.country);
};

/**
 * TileView component
 * Requirements: 2.3, 4.1-4.6
 */
export const TileView: React.FC<TileViewProps> = ({ cities, sortMode, onCitySelect }) => {
  /**
   * Compute grouped cities and sorted country order in one pass
   * Requirements: 4.1-4.4, 4.6
   */
  const { groupedCities, sortedCountries } = useMemo(() => {
    const grouped = groupCitiesByCountry(cities);
    const sorted = sortMode === 'alphabetical'
      ? sortCountriesAlphabetically(Array.from(grouped.keys()))
      : sortCountriesByMostRecent(grouped);
    return { groupedCities: grouped, sortedCountries: sorted };
  }, [cities, sortMode]);

  /**
   * Handle tile click
   * Requirements: 4.6
   */

  return (
    <div className="tile-view">
      {sortedCountries.map(country => {
        const countryCities = groupedCities.get(country) || [];
        
        return (
          <div
            key={country}
            className="country-group"
            style={{ gridColumn: `span ${Math.min(countryCities.length, 3)}` }}
          >
            <h2 className="country-heading">{country}</h2>
            <div className="city-tiles">
              {countryCities.map(city => (
                <div
                  key={city.id}
                  className="city-tile"
                  onClick={() => onCitySelect(city)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCitySelect(city);
                    }
                  }}
                >
                  <h3 className="city-name">{city.name}</h3>
                  {city.datesVisited && city.datesVisited.length > 0 && (
                    <p className="city-tile-date">
                      {new Date(city.datesVisited[city.datesVisited.length - 1])
                        .toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
