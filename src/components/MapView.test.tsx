/**
 * Unit tests for MapView component
 * Requirements: 2.4, 3.1-3.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MapView } from './MapView';
import { City } from '../types';
import * as fc from 'fast-check';

// Mock react-simple-maps to avoid rendering issues in tests
jest.mock('@vnedyalk0v/react19-simple-maps', () => ({
  ComposableMap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composable-map">{children}</div>
  ),
  Geographies: ({ children }: { children: (args: { geographies: any[] }) => React.ReactNode }) => (
    <div data-testid="geographies">{children({ geographies: [] })}</div>
  ),
  Geography: () => <div data-testid="geography" />,
  Marker: ({ children, coordinates }: { children: React.ReactNode; coordinates: [number, number] }) => (
    <div data-testid="marker" data-coordinates={JSON.stringify(coordinates)}>
      <svg>{children}</svg>
    </div>
  ),
  ZoomableGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="zoomable-group">{children}</div>
  )
}));

describe('MapView', () => {
  const mockCities: City[] = [
    {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      googleMapLink: 'https://maps.google.com/tokyo',
      datesVisited: ['2023-01-15'],
      beforeYouGo: 'Bring cash',
      overview: 'Amazing city',
      places: {
        bars: 'Bar 1',
        restaurants: 'Restaurant 1',
        pointsOfInterest: 'POI 1',
        gyms: 'Gym 1',
        accommodations: 'Hotel 1'
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      googleMapLink: 'https://maps.google.com/paris',
      datesVisited: ['2023-03-20'],
      beforeYouGo: 'Learn basic French',
      overview: 'City of lights',
      places: {
        bars: 'Bar 2',
        restaurants: 'Restaurant 2',
        pointsOfInterest: 'POI 2',
        gyms: 'Gym 2',
        accommodations: 'Hotel 2'
      },
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z'
    }
  ];

  const mockOnCitySelect = jest.fn();

  beforeEach(() => {
    mockOnCitySelect.mockClear();
  });

  /**
   * Test: MapView renders world map
   * Requirements: 3.1
   */
  test('renders world map container', () => {
    render(<MapView cities={mockCities} onCitySelect={mockOnCitySelect} />);
    
    expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    expect(screen.getByTestId('zoomable-group')).toBeInTheDocument();
  });

  /**
   * Test: MapView renders markers for all cities
   * Requirements: 3.2, 3.5
   */
  test('renders markers for all cities', () => {
    render(<MapView cities={mockCities} onCitySelect={mockOnCitySelect} />);
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
  });

  /**
   * Test: Markers are positioned at correct coordinates
   * Requirements: 3.2
   */
  test('markers are positioned at city coordinates', () => {
    render(<MapView cities={mockCities} onCitySelect={mockOnCitySelect} />);
    
    const markers = screen.getAllByTestId('marker');
    
    // Check Tokyo marker coordinates
    const tokyoMarker = markers.find(marker => {
      const coords = JSON.parse(marker.getAttribute('data-coordinates') || '[]');
      return coords[0] === 139.6503 && coords[1] === 35.6762;
    });
    expect(tokyoMarker).toBeDefined();
    
    // Check Paris marker coordinates
    const parisMarker = markers.find(marker => {
      const coords = JSON.parse(marker.getAttribute('data-coordinates') || '[]');
      return coords[0] === 2.3522 && coords[1] === 48.8566;
    });
    expect(parisMarker).toBeDefined();
  });

  /**
   * Test: MapView handles empty cities array
   * Requirements: 3.5
   */
  test('renders map with no markers when cities array is empty', () => {
    render(<MapView cities={[]} onCitySelect={mockOnCitySelect} />);
    
    expect(screen.getByTestId('composable-map')).toBeInTheDocument();
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
  });

  /**
   * Test: MapView renders with single city
   * Requirements: 3.2, 3.5
   */
  test('renders map with single city marker', () => {
    render(<MapView cities={[mockCities[0]]} onCitySelect={mockOnCitySelect} />);
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(1);
  });

  describe('Property-based tests', () => {
    describe('Property 3: Map markers positioned at city coordinates', () => {
      /**
       * **Validates: Requirements 3.2, 3.5**
       * 
       * Property: For any list of cities, the MapView component SHALL display
       * markers on the map such that:
       * 1. Each city has exactly one marker
       * 2. Each marker is positioned at the city's exact coordinates (longitude, latitude)
       * 3. All cities are displayed simultaneously on the map
       * 4. No markers exist for cities not in the input list
       */
      it('should always position markers at correct city coordinates', () => {
        fc.assert(
          fc.property(
            // Generate arbitrary list of cities with valid geographic coordinates
            fc.array(
              fc.record({
                id: fc.uuid(),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                country: fc.constantFrom(
                  'France',
                  'Germany',
                  'Spain',
                  'Japan',
                  'United Kingdom',
                  'United States',
                  'Brazil',
                  'Australia',
                  'Canada',
                  'Italy'
                ),
                // Valid latitude range: -90 to 90
                latitude: fc.double({ min: -90, max: 90, noNaN: true }),
                // Valid longitude range: -180 to 180
                longitude: fc.double({ min: -180, max: 180, noNaN: true }),
                googleMapLink: fc.constantFrom('https://maps.google.com/?q=test'),
                datesVisited: fc.array(
                  fc.integer({ min: 946684800000, max: 1893456000000 })
                    .map((ms: number) => new Date(ms).toISOString()),
                  { minLength: 1, maxLength: 3 }
                ),
                beforeYouGo: fc.string({ maxLength: 50 }),
                overview: fc.string({ maxLength: 50 }),
                places: fc.record({
                  bars: fc.string({ maxLength: 30 }),
                  restaurants: fc.string({ maxLength: 30 }),
                  pointsOfInterest: fc.string({ maxLength: 30 }),
                  gyms: fc.string({ maxLength: 30 }),
                  accommodations: fc.string({ maxLength: 30 })
                }),
                createdAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                  .map((ms: number) => new Date(ms).toISOString()),
                updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                  .map((ms: number) => new Date(ms).toISOString())
              }),
              { minLength: 0, maxLength: 20 }
            ),
            (cities: City[]) => {
              const mockOnCitySelect = jest.fn();
              const { unmount } = render(<MapView cities={cities} onCitySelect={mockOnCitySelect} />);

              // Get all rendered markers
              const markers = screen.queryAllByTestId('marker');

              // Property 1: Number of markers equals number of cities
              expect(markers.length).toBe(cities.length);

              // Property 2 & 3: Each city has a marker at its exact coordinates
              cities.forEach(city => {
                const markerForCity = markers.find(marker => {
                  const coordsAttr = marker.getAttribute('data-coordinates');
                  if (!coordsAttr) return false;
                  
                  const coords = JSON.parse(coordsAttr);
                  // Coordinates should be [longitude, latitude]
                  return coords[0] === city.longitude && coords[1] === city.latitude;
                });

                // Each city must have a marker at its exact coordinates
                expect(markerForCity).toBeDefined();
              });

              // Property 4: No extra markers exist
              // Verify each marker corresponds to a city in the input list
              if (markers.length > 0) {
                markers.forEach(marker => {
                  const coordsAttr = marker.getAttribute('data-coordinates');
                  expect(coordsAttr).toBeTruthy();
                  
                  const coords = JSON.parse(coordsAttr!);
                  const [longitude, latitude] = coords;

                  // Find a city with these coordinates
                  const cityForMarker = cities.find(
                    city => city.longitude === longitude && city.latitude === latitude
                  );

                  // Each marker must correspond to a city in the input
                  expect(cityForMarker).toBeDefined();
                });
              }

              // Clean up
              unmount();
            }
          ),
          { numRuns: 20 }
        );
      });
    });
  });
});
