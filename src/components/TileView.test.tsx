/**
 * Unit tests for TileView component
 * Requirements: 2.3, 4.1-4.6
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { TileView } from './TileView';
import { City } from '../types';
import * as fc from 'fast-check';

/**
 * Helper function to create mock city data
 */
const createMockCity = (
  id: string,
  name: string,
  country: string,
  datesVisited: string[]
): City => ({
  id,
  name,
  country,
  latitude: 0,
  longitude: 0,
  googleMapLink: '',
  datesVisited,
  beforeYouGo: '',
  overview: '',
  places: {
    bars: '',
    restaurants: '',
    pointsOfInterest: '',
    gyms: '',
    accommodations: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

describe('TileView', () => {
  const mockOnCitySelect = jest.fn();

  beforeEach(() => {
    mockOnCitySelect.mockClear();
  });

  describe('City grouping by country', () => {
    it('should group cities by country', () => {
      // Requirements: 4.1
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01']),
        createMockCity('2', 'London', 'United Kingdom', ['2023-02-01']),
        createMockCity('3', 'Lyon', 'France', ['2023-03-01'])
      ];

      render(<TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />);

      // Check that country headings are displayed
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();

      // Check that cities are displayed
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Lyon')).toBeInTheDocument();
    });

    it('should display all cities under their respective countries', () => {
      // Requirements: 4.1
      const cities: City[] = [
        createMockCity('1', 'Tokyo', 'Japan', ['2023-01-01']),
        createMockCity('2', 'Osaka', 'Japan', ['2023-02-01']),
        createMockCity('3', 'Seoul', 'South Korea', ['2023-03-01'])
      ];

      render(<TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />);

      // Both Japanese cities should be under Japan
      const japanSection = screen.getByText('Japan').closest('.country-group');
      expect(japanSection).toBeInTheDocument();
      
      // Check cities are rendered
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
      expect(screen.getByText('Osaka')).toBeInTheDocument();
      expect(screen.getByText('Seoul')).toBeInTheDocument();
    });
  });

  describe('Alphabetical sorting', () => {
    it('should sort countries alphabetically when sortMode is alphabetical', () => {
      // Requirements: 4.3
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-03-01']),
        createMockCity('2', 'Berlin', 'Germany', ['2023-02-01']),
        createMockCity('3', 'Madrid', 'Spain', ['2023-01-01'])
      ];

      render(<TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />);

      const countryHeadings = screen.getAllByRole('heading', { level: 2 });
      const countryNames = countryHeadings.map(h => h.textContent);

      // Should be alphabetically sorted: France, Germany, Spain
      expect(countryNames).toEqual(['France', 'Germany', 'Spain']);
    });
  });

  describe('Date-based sorting', () => {
    it('should sort countries by most recent visit when sortMode is date', () => {
      // Requirements: 4.4
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01']),
        createMockCity('2', 'Berlin', 'Germany', ['2023-03-01']), // Most recent
        createMockCity('3', 'Madrid', 'Spain', ['2023-02-01'])
      ];

      render(<TileView cities={cities} sortMode="date" onCitySelect={mockOnCitySelect} />);

      const countryHeadings = screen.getAllByRole('heading', { level: 2 });
      const countryNames = countryHeadings.map(h => h.textContent);

      // Should be sorted by date descending: Germany (Mar), Spain (Feb), France (Jan)
      expect(countryNames).toEqual(['Germany', 'Spain', 'France']);
    });

    it('should use most recent date when country has multiple cities', () => {
      // Requirements: 4.4
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01']),
        createMockCity('2', 'Lyon', 'France', ['2023-05-01']), // Most recent in France
        createMockCity('3', 'Berlin', 'Germany', ['2023-03-01'])
      ];

      render(<TileView cities={cities} sortMode="date" onCitySelect={mockOnCitySelect} />);

      const countryHeadings = screen.getAllByRole('heading', { level: 2 });
      const countryNames = countryHeadings.map(h => h.textContent);

      // France should be first (May) before Germany (March)
      expect(countryNames).toEqual(['France', 'Germany']);
    });

    it('should handle cities with multiple dates visited', () => {
      // Requirements: 4.4
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01', '2023-06-01']), // Most recent overall
        createMockCity('2', 'Berlin', 'Germany', ['2023-03-01', '2023-04-01'])
      ];

      render(<TileView cities={cities} sortMode="date" onCitySelect={mockOnCitySelect} />);

      const countryHeadings = screen.getAllByRole('heading', { level: 2 });
      const countryNames = countryHeadings.map(h => h.textContent);

      // France should be first (June) before Germany (April)
      expect(countryNames).toEqual(['France', 'Germany']);
    });
  });

  describe('Tile click events', () => {
    it('should call onCitySelect when a tile is clicked', () => {
      // Requirements: 4.6
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01'])
      ];

      render(<TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />);

      const tile = screen.getByText('Paris').closest('.city-tile');
      expect(tile).toBeInTheDocument();

      fireEvent.click(tile!);

      expect(mockOnCitySelect).toHaveBeenCalledTimes(1);
      expect(mockOnCitySelect).toHaveBeenCalledWith(cities[0]);
    });

    it('should handle keyboard events (Enter key)', () => {
      // Requirements: 4.6
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01'])
      ];

      render(<TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />);

      const tile = screen.getByText('Paris').closest('.city-tile');
      expect(tile).toBeInTheDocument();

      fireEvent.keyDown(tile!, { key: 'Enter' });

      expect(mockOnCitySelect).toHaveBeenCalledTimes(1);
      expect(mockOnCitySelect).toHaveBeenCalledWith(cities[0]);
    });

    it('should handle keyboard events (Space key)', () => {
      // Requirements: 4.6
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01'])
      ];

      render(<TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />);

      const tile = screen.getByText('Paris').closest('.city-tile');
      expect(tile).toBeInTheDocument();

      fireEvent.keyDown(tile!, { key: ' ' });

      expect(mockOnCitySelect).toHaveBeenCalledTimes(1);
      expect(mockOnCitySelect).toHaveBeenCalledWith(cities[0]);
    });
  });

  describe('Re-rendering on sort mode change', () => {
    it('should re-render when sortMode changes', () => {
      // Requirements: 4.6
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01']),
        createMockCity('2', 'Berlin', 'Germany', ['2023-03-01'])
      ];

      const { rerender } = render(
        <TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />
      );

      let countryHeadings = screen.getAllByRole('heading', { level: 2 });
      let countryNames = countryHeadings.map(h => h.textContent);
      expect(countryNames).toEqual(['France', 'Germany']);

      // Change to date sorting
      rerender(<TileView cities={cities} sortMode="date" onCitySelect={mockOnCitySelect} />);

      countryHeadings = screen.getAllByRole('heading', { level: 2 });
      countryNames = countryHeadings.map(h => h.textContent);
      expect(countryNames).toEqual(['Germany', 'France']);
    });
  });

  describe('Empty state', () => {
    it('should render nothing when cities array is empty', () => {
      const { container } = render(
        <TileView cities={[]} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />
      );

      expect(container.querySelector('.country-group')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles and keyboard support', () => {
      // Requirements: 4.6
      const cities: City[] = [
        createMockCity('1', 'Paris', 'France', ['2023-01-01'])
      ];

      render(<TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />);

      const tile = screen.getByText('Paris').closest('.city-tile');
      
      expect(tile).toHaveAttribute('role', 'button');
      expect(tile).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Property-based tests', () => {
    describe('Property 4: Cities grouped by country in tile view', () => {
      /**
       * **Validates: Requirements 4.1**
       * 
       * Property: For any list of cities, the TileView component SHALL group
       * cities by their country field such that:
       * 1. Each city appears exactly once in the rendered output
       * 2. All cities with the same country value appear under the same country heading
       * 3. No city appears under a different country heading
       * 4. The number of country groups equals the number of unique countries
       */
      it('should always group cities by country correctly', () => {
        fc.assert(
          fc.property(
            // Generate arbitrary list of cities with various countries
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
                  'United States'
                ),
                latitude: fc.double({ min: -90, max: 90 }),
                longitude: fc.double({ min: -180, max: 180 }),
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
              // Skip empty arrays as there's nothing to validate
              if (cities.length === 0) {
                return true;
              }

              const mockOnCitySelect = jest.fn();
              const { container } = render(
                <TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />
              );

              // Get all country groups
              const countryGroups = container.querySelectorAll('.country-group');
              
              // Property 1: Number of country groups should equal number of unique countries
              const uniqueCountries = new Set(cities.map(c => c.country));
              expect(countryGroups.length).toBe(uniqueCountries.size);

              // Property 2: Each country group should have the correct heading
              const renderedCountries = Array.from(countryGroups).map(group => {
                const heading = group.querySelector('.country-heading');
                return heading?.textContent || '';
              });
              
              // All rendered countries should be from the unique set
              renderedCountries.forEach(country => {
                expect(uniqueCountries.has(country)).toBe(true);
              });

              // Property 3: Each city should appear exactly once
              const allRenderedCityNames = Array.from(container.querySelectorAll('.city-name'))
                .map(el => el.textContent);
              
              expect(allRenderedCityNames.length).toBe(cities.length);

              // Property 4: Cities should be under their correct country heading
              countryGroups.forEach(group => {
                const countryHeading = group.querySelector('.country-heading')?.textContent || '';
                const cityTiles = group.querySelectorAll('.city-name');
                const cityNamesInGroup = Array.from(cityTiles).map(el => el.textContent);

                // Get expected cities for this country
                const expectedCities = cities
                  .filter(c => c.country === countryHeading)
                  .map(c => c.name);

                // All cities in this group should belong to this country
                cityNamesInGroup.forEach(cityName => {
                  expect(expectedCities).toContain(cityName);
                });

                // All cities for this country should be in this group
                expect(cityNamesInGroup.length).toBe(expectedCities.length);
              });

              return true;
            }
          ),
          { numRuns: 15 }
        );
      });
    });

    describe('Property 5: Alphabetical sorting orders countries correctly', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: When sortMode is 'alphabetical', the TileView component SHALL
       * order countries alphabetically such that:
       * 1. Countries are sorted in ascending alphabetical order (A-Z)
       * 2. The sorting is case-insensitive and locale-aware
       * 3. For any two adjacent countries, the first comes before the second alphabetically
       * 4. The ordering is consistent across re-renders with the same data
       */
      it('should always sort countries alphabetically when sortMode is alphabetical', () => {
        fc.assert(
          fc.property(
            // Generate arbitrary list of cities with various countries
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
                latitude: fc.double({ min: -90, max: 90 }),
                longitude: fc.double({ min: -180, max: 180 }),
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
              { minLength: 2, maxLength: 20 } // At least 2 cities to test ordering
            ),
            (cities: City[]) => {
              // Skip if we don't have at least 2 unique countries
              const uniqueCountries = new Set(cities.map(c => c.country));
              if (uniqueCountries.size < 2) {
                return true;
              }

              const mockOnCitySelect = jest.fn();
              const { container } = render(
                <TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />
              );

              // Get all country headings in rendered order
              const countryHeadings = container.querySelectorAll('.country-heading');
              const renderedCountries = Array.from(countryHeadings).map(
                heading => heading.textContent || ''
              );

              // Property 1: Countries should be in alphabetical order
              const expectedOrder = Array.from(uniqueCountries).sort((a, b) => 
                a.localeCompare(b)
              );
              expect(renderedCountries).toEqual(expectedOrder);

              // Property 2: For any two adjacent countries, first comes before second
              for (let i = 0; i < renderedCountries.length - 1; i++) {
                const current = renderedCountries[i];
                const next = renderedCountries[i + 1];
                expect(current.localeCompare(next)).toBeLessThan(0);
              }

              // Property 3: Verify consistency - re-render and check order is the same
              const { container: container2 } = render(
                <TileView cities={cities} sortMode="alphabetical" onCitySelect={mockOnCitySelect} />
              );
              
              const countryHeadings2 = container2.querySelectorAll('.country-heading');
              const renderedCountries2 = Array.from(countryHeadings2).map(
                heading => heading.textContent || ''
              );
              
              expect(renderedCountries2).toEqual(renderedCountries);

              return true;
            }
          ),
          { numRuns: 15 }
        );
      });
    });

    describe('Property 6: Date-based sorting orders by most recent visit', () => {
      /**
       * **Validates: Requirements 4.4**
       * 
       * Property: When sortMode is 'date', the TileView component SHALL
       * order countries by the most recent visit date such that:
       * 1. Countries are sorted in descending order by their most recent visit date
       * 2. For countries with multiple cities, the most recent date across all cities is used
       * 3. For any two adjacent countries, the first has a more recent or equal visit date than the second
       * 4. Cities with multiple dates use their most recent date
       * 5. The ordering is consistent across re-renders with the same data
       */
      it('should always sort countries by most recent visit date when sortMode is date', () => {
        fc.assert(
          fc.property(
            // Generate arbitrary list of cities with various countries and dates
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
                latitude: fc.double({ min: -90, max: 90 }),
                longitude: fc.double({ min: -180, max: 180 }),
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
              { minLength: 2, maxLength: 20 } // At least 2 cities to test ordering
            ),
            (cities: City[]) => {
              // Skip if we don't have at least 2 unique countries
              const uniqueCountries = new Set(cities.map(c => c.country));
              if (uniqueCountries.size < 2) {
                return true;
              }

              const mockOnCitySelect = jest.fn();
              const { container } = render(
                <TileView cities={cities} sortMode="date" onCitySelect={mockOnCitySelect} />
              );

              // Get all country headings in rendered order
              const countryHeadings = container.querySelectorAll('.country-heading');
              const renderedCountries = Array.from(countryHeadings).map(
                heading => heading.textContent || ''
              );

              // Helper function to get most recent date from a city
              const getMostRecentDate = (city: City): Date => {
                if (!city.datesVisited || city.datesVisited.length === 0) {
                  return new Date(0);
                }
                const dates = city.datesVisited.map(dateStr => new Date(dateStr));
                return new Date(Math.max(...dates.map(d => d.getTime())));
              };

              // Build expected order: group by country, find most recent date per country, sort descending
              const countryToMostRecentDate = new Map<string, Date>();
              
              cities.forEach(city => {
                const cityMostRecent = getMostRecentDate(city);
                const currentMostRecent = countryToMostRecentDate.get(city.country);
                
                if (!currentMostRecent || cityMostRecent > currentMostRecent) {
                  countryToMostRecentDate.set(city.country, cityMostRecent);
                }
              });

              // Sort countries by most recent date descending
              const expectedOrder = Array.from(countryToMostRecentDate.entries())
                .sort((a, b) => b[1].getTime() - a[1].getTime())
                .map(([country]) => country);

              // Property 1: Countries should be in date-descending order
              expect(renderedCountries).toEqual(expectedOrder);

              // Property 2: For any two adjacent countries, first has more recent or equal date
              for (let i = 0; i < renderedCountries.length - 1; i++) {
                const currentCountry = renderedCountries[i];
                const nextCountry = renderedCountries[i + 1];
                
                const currentDate = countryToMostRecentDate.get(currentCountry);
                const nextDate = countryToMostRecentDate.get(nextCountry);
                
                expect(currentDate).toBeDefined();
                expect(nextDate).toBeDefined();
                
                // Current should be >= next (more recent or equal)
                expect(currentDate!.getTime()).toBeGreaterThanOrEqual(nextDate!.getTime());
              }

              // Property 3: Verify consistency - re-render and check order is the same
              const { container: container2 } = render(
                <TileView cities={cities} sortMode="date" onCitySelect={mockOnCitySelect} />
              );
              
              const countryHeadings2 = container2.querySelectorAll('.country-heading');
              const renderedCountries2 = Array.from(countryHeadings2).map(
                heading => heading.textContent || ''
              );
              
              expect(renderedCountries2).toEqual(renderedCountries);

              return true;
            }
          ),
          { numRuns: 15 }
        );
      });
    });
  });
});
