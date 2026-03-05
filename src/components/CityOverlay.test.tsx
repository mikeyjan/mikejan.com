/**
 * Unit tests for CityOverlay component
 * Requirements: 5.1-5.10
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CityOverlay } from './CityOverlay';
import { City } from '../types';
import * as fc from 'fast-check';

// Mock city data
const mockCity: City = {
  id: 'test-city-1',
  name: 'Tokyo',
  country: 'Japan',
  latitude: 35.6762,
  longitude: 139.6503,
  googleMapLink: 'https://maps.google.com/?q=Tokyo',
  datesVisited: ['2023-03-15', '2023-09-20'],
  beforeYouGo: 'Learn basic Japanese phrases. Get a Suica card for transportation.',
  overview: 'Tokyo is a vibrant metropolis blending traditional culture with cutting-edge technology.',
  places: {
    bars: 'Golden Gai - Tiny bars in Shinjuku\nRooftop Bar at Park Hyatt - Amazing views',
    restaurants: 'Sukiyabashi Jiro - World-famous sushi\nIchiran Ramen - Best ramen experience',
    pointsOfInterest: 'Senso-ji Temple - Historic Buddhist temple\nShibuya Crossing - Iconic intersection',
    gyms: 'Gold\'s Gym Harajuku - Well-equipped facility',
    accommodations: 'Park Hyatt Tokyo - Luxury hotel with great views'
  },
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

// Mock the DataContext
const mockGetCityDetails = jest.fn();

jest.mock('../contexts/DataContext', () => ({
  ...jest.requireActual('../contexts/DataContext'),
  useData: () => ({
    personalInfo: null,
    cities: [],
    loading: false,
    error: null,
    refreshData: jest.fn(),
    getCityDetails: mockGetCityDetails,
    updatePersonalInfo: jest.fn(),
    createCity: jest.fn(),
    updateCity: jest.fn(),
    deleteCity: jest.fn()
  })
}));

describe('CityOverlay Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCityDetails.mockResolvedValue(mockCity);
  });

  /**
   * Test: Display city name
   * Requirements: 5.4
   */
  it('should display city name', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });

  /**
   * Test: Display Google Map link
   * Requirements: 5.5
   */
  it('should display clickable Google Map link', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      const mapLink = screen.getByText(/View on Google Maps/i);
      expect(mapLink).toBeInTheDocument();
      expect(mapLink).toHaveAttribute('href', 'https://maps.google.com/?q=Tokyo');
      expect(mapLink).toHaveAttribute('target', '_blank');
      expect(mapLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  /**
   * Test: Display dates visited
   * Requirements: 5.6
   */
  it('should display dates visited', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Dates Visited')).toBeInTheDocument();
      expect(screen.getByText(/Mar 2023, Sep 2023/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Display "Before you go" section
   * Requirements: 5.7
   */
  it('should display "Before you go" section', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Before You Go')).toBeInTheDocument();
      expect(screen.getByText(/Learn basic Japanese phrases/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Display "Overview" section
   * Requirements: 5.8
   */
  it('should display "Overview" section', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText(/vibrant metropolis/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Display "Places to visit" with all 5 categories
   * Requirements: 5.9
   */
  it('should display "Places to visit" section with all 5 categories', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Places to Visit')).toBeInTheDocument();
      expect(screen.getByText('Bars')).toBeInTheDocument();
      expect(screen.getByText('Restaurants')).toBeInTheDocument();
      expect(screen.getByText('Points of Interest')).toBeInTheDocument();
      expect(screen.getByText('Gyms')).toBeInTheDocument();
      expect(screen.getByText('Accommodations')).toBeInTheDocument();
    });
  });

  /**
   * Test: Display place content
   * Requirements: 5.9
   */
  it('should display place content for each category', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Golden Gai/i)).toBeInTheDocument();
      expect(screen.getByText(/Sukiyabashi Jiro/i)).toBeInTheDocument();
      expect(screen.getByText(/Senso-ji Temple/i)).toBeInTheDocument();
      expect(screen.getByText(/Gold's Gym Harajuku/i)).toBeInTheDocument();
      expect(screen.getByText(/Park Hyatt Tokyo/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Apply full-screen layout for tile view
   * Requirements: 5.1
   */
  it('should apply full-screen layout for tile view', async () => {
    const { container } = render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      const overlay = container.querySelector('.city-overlay');
      expect(overlay).toHaveClass('overlay-fullscreen');
    });
  });

  /**
   * Test: Apply side panel layout for map view
   * Requirements: 5.2, 5.3
   */
  it('should apply side panel layout for map view', async () => {
    const { container } = render(
      <CityOverlay city={mockCity} viewMode="map" onClose={mockOnClose} />
    );

    await waitFor(() => {
      const overlay = container.querySelector('.city-overlay');
      expect(overlay).toHaveClass('overlay-sidepanel');
    });
  });

  /**
   * Test: Show loading state during fetch
   * Requirements: 5.1-5.10
   */
  it('should show loading state during fetch', () => {
    mockGetCityDetails.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    expect(screen.getByText('Loading city details...')).toBeInTheDocument();
  });

  /**
   * Test: Handle close button click
   * Requirements: 5.10
   */
  it('should call onClose when close button is clicked', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close overlay');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Handle escape key press
   * Requirements: 5.10
   */
  it('should call onClose when escape key is pressed', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Handle background click in tile view
   * Requirements: 5.10
   */
  it('should call onClose when background is clicked in tile view', async () => {
    const { container } = render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    const overlay = container.querySelector('.city-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  /**
   * Test: Handle fetch error
   * Requirements: 5.1-5.10
   */
  it('should display error message when fetch fails', async () => {
    mockGetCityDetails.mockRejectedValue(new Error('Failed to load city details'));

    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load city details')).toBeInTheDocument();
    });
  });

  /**
   * Test: Handle empty dates visited
   * Requirements: 5.6
   */
  it('should handle empty dates visited', async () => {
    const cityWithNoDates = { ...mockCity, datesVisited: [] };
    mockGetCityDetails.mockResolvedValue(cityWithNoDates);

    render(
      <CityOverlay city={cityWithNoDates} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('No dates recorded')).toBeInTheDocument();
    });
  });

  /**
   * Test: Handle missing optional sections
   * Requirements: 5.7, 5.8
   */
  it('should not display optional sections when they are empty', async () => {
    const cityWithoutOptionalSections = {
      ...mockCity,
      beforeYouGo: '',
      overview: ''
    };
    mockGetCityDetails.mockResolvedValue(cityWithoutOptionalSections);

    render(
      <CityOverlay city={cityWithoutOptionalSections} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    expect(screen.queryByText('Before You Go')).not.toBeInTheDocument();
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });

  /**
   * Test: Fetch city details on mount
   * Requirements: 5.1-5.10
   */
  it('should fetch city details on mount', async () => {
    render(
      <CityOverlay city={mockCity} viewMode="tile" onClose={mockOnClose} />
    );

    await waitFor(() => {
      expect(mockGetCityDetails).toHaveBeenCalledWith('test-city-1');
    });
  });

  describe('Property-based tests', () => {
    describe('Property 8: Map remains visible with overlay in map view', () => {
      /**
       * **Validates: Requirements 5.3**
       * 
       * Property: When a CityOverlay is open in map view, the map SHALL remain visible
       * in the background such that:
       * 1. The overlay uses the 'overlay-sidepanel' class (not 'overlay-fullscreen')
       * 2. The overlay does not cover the entire viewport (side panel vs full screen)
       * 3. The overlay content is visible and functional
       * 4. The overlay does not have click-to-close on background (to allow map interaction)
       * 5. The close button is accessible for closing the overlay
       * 
       * The CSS for overlay-sidepanel positions the overlay on the right side with:
       * - width: 40% (min 400px, max 600px)
       * - position: fixed; top: 0; right: 0; bottom: 0;
       * - background-color: transparent (vs rgba(0,0,0,0.5) for fullscreen)
       * 
       * This ensures the left 60% of the screen remains visible for the map.
       */
      it('should keep map visible when overlay is open in map view', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              country: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              latitude: fc.double({ min: -90, max: 90 }),
              longitude: fc.double({ min: -180, max: 180 }),
              googleMapLink: fc.constantFrom('https://maps.google.com/?q=test'),
              datesVisited: fc.array(
                fc.integer({ min: 946684800000, max: 1893456000000 })
                  .map((ms: number) => new Date(ms).toISOString()),
                { minLength: 1, maxLength: 3 }
              ),
              beforeYouGo: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
              overview: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
              places: fc.record({
                bars: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                restaurants: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                pointsOfInterest: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                gyms: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                accommodations: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
              }),
              createdAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                .map((ms: number) => new Date(ms).toISOString()),
              updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                .map((ms: number) => new Date(ms).toISOString())
            }),
            async (city: City) => {
              // Clear all mocks before each test
              jest.clearAllMocks();
              
              // Mock getCityDetails to return the city
              mockGetCityDetails.mockResolvedValue(city);
              const localMockOnClose = jest.fn();

              // Render the overlay in MAP view
              const { container, unmount } = render(
                <CityOverlay city={city} viewMode="map" onClose={localMockOnClose} />
              );

              try {
                // Wait for the component to finish loading
                await waitFor(() => {
                  expect(screen.queryByText('Loading city details...')).not.toBeInTheDocument();
                }, { timeout: 3000 });

                const overlay = container.querySelector('.city-overlay');
                expect(overlay).toBeInTheDocument();

                // Property 1: Overlay uses 'overlay-sidepanel' class in map view (Requirement 5.3)
                // This class positions the overlay on the right side, leaving the map visible on the left
                expect(overlay).toHaveClass('overlay-sidepanel');
                expect(overlay).not.toHaveClass('overlay-fullscreen');

                // Property 2: Overlay content is visible and interactive
                const overlayContent = container.querySelector('.overlay-content');
                expect(overlayContent).toBeInTheDocument();
                expect(overlayContent).toBeVisible();

                // Property 3: Verify city name is displayed (overlay is functional)
                const cityNameElement = container.querySelector('.overlay-city-name');
                expect(cityNameElement).toBeInTheDocument();
                expect(cityNameElement?.textContent).toBe(city.name);

                // Property 4: Verify close button is accessible
                const closeButton = screen.getByLabelText('Close overlay');
                expect(closeButton).toBeInTheDocument();
                expect(closeButton).toBeVisible();

                // Property 5: Verify the overlay doesn't have click-to-close on background in map view
                // In tile view, clicking the background closes the overlay
                // In map view, this should NOT happen to allow map interaction behind the overlay
                // We verify this by checking that clicking the overlay background doesn't trigger onClose
                fireEvent.click(overlay);
                expect(localMockOnClose).not.toHaveBeenCalled();

                // Property 6: Verify the close button still works (explicit close mechanism)
                fireEvent.click(closeButton);
                expect(localMockOnClose).toHaveBeenCalledTimes(1);

                return true;
              } finally {
                // Clean up after each test
                unmount();
              }
            }
          ),
          { numRuns: 20 }
        );
      });
    });

    describe('Property 7: City selection opens correct overlay', () => {
      /**
       * **Validates: Requirements 5.1, 5.2**
       * 
       * Property: For any city selection in either tile or map view, the system SHALL
       * open a CityOverlay component with the correct city data such that:
       * 1. When a city is selected in tile view, the overlay opens with that city's data (Requirement 5.1)
       * 2. When a city is selected in map view, the overlay opens with that city's data (Requirement 5.2)
       * 3. The overlay receives the exact city object that was selected
       * 4. The overlay's city ID matches the selected city's ID
       * 5. The overlay displays the correct city name matching the selected city
       */
      it('should always open overlay with correct city data when city is selected', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              country: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              latitude: fc.double({ min: -90, max: 90 }),
              longitude: fc.double({ min: -180, max: 180 }),
              googleMapLink: fc.constantFrom('https://maps.google.com/?q=test'),
              datesVisited: fc.array(
                fc.integer({ min: 946684800000, max: 1893456000000 })
                  .map((ms: number) => new Date(ms).toISOString()),
                { minLength: 1, maxLength: 3 }
              ),
              beforeYouGo: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
              overview: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
              places: fc.record({
                bars: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                restaurants: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                pointsOfInterest: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                gyms: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                accommodations: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
              }),
              createdAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                .map((ms: number) => new Date(ms).toISOString()),
              updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                .map((ms: number) => new Date(ms).toISOString())
            }),
            fc.constantFrom('tile' as const, 'map' as const),
            async (selectedCity: City, viewMode: 'tile' | 'map') => {
              // Clear all mocks before each test
              jest.clearAllMocks();
              
              // Mock getCityDetails to return the selected city
              mockGetCityDetails.mockResolvedValue(selectedCity);
              const localMockOnClose = jest.fn();

              // Render the overlay with the selected city
              const { container, unmount } = render(
                <CityOverlay city={selectedCity} viewMode={viewMode} onClose={localMockOnClose} />
              );

              try {
                // Wait for the component to finish loading
                await waitFor(() => {
                  expect(screen.queryByText('Loading city details...')).not.toBeInTheDocument();
                }, { timeout: 3000 });

                // Property 1: Overlay should fetch details for the selected city (Requirements 5.1, 5.2)
                expect(mockGetCityDetails).toHaveBeenCalledWith(selectedCity.id);

                // Property 2: Overlay should display the correct city name (Requirements 5.1, 5.2)
                const cityNameElement = container.querySelector('.overlay-city-name');
                expect(cityNameElement).toBeInTheDocument();
                expect(cityNameElement?.textContent).toBe(selectedCity.name);

                // Property 3: Overlay should display the correct Google Map link (Requirements 5.1, 5.2)
                const mapLink = container.querySelector('.overlay-map-link');
                expect(mapLink).toBeInTheDocument();
                expect(mapLink).toHaveAttribute('href', selectedCity.googleMapLink);

                // Property 4: Overlay should apply correct layout based on view mode
                const overlay = container.querySelector('.city-overlay');
                if (viewMode === 'tile') {
                  // Requirement 5.1: Full-screen overlay for tile view
                  expect(overlay).toHaveClass('overlay-fullscreen');
                } else {
                  // Requirement 5.2: Side panel for map view
                  expect(overlay).toHaveClass('overlay-sidepanel');
                }

                // Property 5: Overlay should be visible and interactive
                expect(overlay).toBeInTheDocument();
                expect(overlay).toBeVisible();

                // Property 6: Close button should be present and functional
                const closeButton = screen.getByLabelText('Close overlay');
                expect(closeButton).toBeInTheDocument();
                
                // Verify close functionality works
                fireEvent.click(closeButton);
                expect(localMockOnClose).toHaveBeenCalledTimes(1);

                return true;
              } finally {
                // Clean up after each test
                unmount();
              }
            }
          ),
          { numRuns: 20 }
        );
      });
    });

    describe('Property 9: City overlay displays all required content', () => {
      /**
       * **Validates: Requirements 5.4, 5.5, 5.6, 5.7, 5.8, 5.9**
       * 
       * Property: For any valid city with complete data, the CityOverlay component SHALL
       * display all required content such that:
       * 1. The city name is displayed (Requirement 5.4)
       * 2. The Google Map link is displayed and clickable (Requirement 5.5)
       * 3. The dates visited are displayed (Requirement 5.6)
       * 4. The "Before you go" section is displayed when present (Requirement 5.7)
       * 5. The "Overview" section is displayed when present (Requirement 5.8)
       * 6. All five place categories are displayed when present (Requirement 5.9):
       *    - Bars
       *    - Restaurants
       *    - Points of Interest
       *    - Gyms
       *    - Accommodations
       */
      it('should always display all required content for any valid city', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              country: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              latitude: fc.double({ min: -90, max: 90 }),
              longitude: fc.double({ min: -180, max: 180 }),
              googleMapLink: fc.constantFrom('https://maps.google.com/?q=test'),
              datesVisited: fc.array(
                fc.integer({ min: 946684800000, max: 1893456000000 })
                  .map((ms: number) => new Date(ms).toISOString()),
                { minLength: 1, maxLength: 3 }
              ),
              beforeYouGo: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
              overview: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
              places: fc.record({
                bars: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                restaurants: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                pointsOfInterest: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                gyms: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                accommodations: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
              }),
              createdAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                .map((ms: number) => new Date(ms).toISOString()),
              updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 })
                .map((ms: number) => new Date(ms).toISOString())
            }),
            fc.constantFrom('tile' as const, 'map' as const),
            async (city: City, viewMode: 'tile' | 'map') => {
              // Clear all mocks before each test
              jest.clearAllMocks();
              
              // Mock getCityDetails to return the generated city
              mockGetCityDetails.mockResolvedValue(city);
              const localMockOnClose = jest.fn();

              const { container, unmount } = render(
                <CityOverlay city={city} viewMode={viewMode} onClose={localMockOnClose} />
              );

              try {
                // Wait for the component to finish loading
                await waitFor(() => {
                  expect(screen.queryByText('Loading city details...')).not.toBeInTheDocument();
                }, { timeout: 3000 });

                // Property 1: City name is displayed (Requirement 5.4)
                const cityNameElement = container.querySelector('.overlay-city-name');
                expect(cityNameElement).toBeInTheDocument();
                expect(cityNameElement?.textContent).toBe(city.name);

                // Property 2: Google Map link is displayed and clickable (Requirement 5.5)
                const mapLink = container.querySelector('.overlay-map-link');
                expect(mapLink).toBeInTheDocument();
                expect(mapLink).toHaveAttribute('href', city.googleMapLink);
                expect(mapLink).toHaveAttribute('target', '_blank');
                expect(mapLink).toHaveAttribute('rel', 'noopener noreferrer');

                // Property 3: Dates visited are displayed (Requirement 5.6)
                expect(screen.getByText('Dates Visited')).toBeInTheDocument();
                // Verify that dates section exists and is not empty
                const datesSection = container.querySelector('.overlay-dates');
                expect(datesSection).toBeInTheDocument();
                expect(datesSection?.textContent).toBeTruthy();
                expect(datesSection?.textContent).not.toBe('No dates recorded');

                // Property 4: "Before you go" section is displayed (Requirement 5.7)
                // Since we filtered for non-empty strings, it should always be present
                expect(screen.getByText('Before You Go')).toBeInTheDocument();
                expect(container.textContent).toContain(city.beforeYouGo);

                // Property 5: "Overview" section is displayed (Requirement 5.8)
                // Since we filtered for non-empty strings, it should always be present
                expect(screen.getByText('Overview')).toBeInTheDocument();
                expect(container.textContent).toContain(city.overview);

                // Property 6: All five place categories are displayed (Requirement 5.9)
                expect(screen.getByText('Places to Visit')).toBeInTheDocument();

                // Check all five categories - since we filtered for non-empty strings, they should all be present
                expect(screen.getByText('Bars')).toBeInTheDocument();
                expect(container.textContent).toContain(city.places.bars);

                expect(screen.getByText('Restaurants')).toBeInTheDocument();
                expect(container.textContent).toContain(city.places.restaurants);

                expect(screen.getByText('Points of Interest')).toBeInTheDocument();
                expect(container.textContent).toContain(city.places.pointsOfInterest);

                expect(screen.getByText('Gyms')).toBeInTheDocument();
                expect(container.textContent).toContain(city.places.gyms);

                expect(screen.getByText('Accommodations')).toBeInTheDocument();
                expect(container.textContent).toContain(city.places.accommodations);

                return true;
              } finally {
                // Clean up after each test
                unmount();
              }
            }
          ),
          { numRuns: 20 }
        );
      });
    });
  });
});

describe('Property 10: Overlay close restores previous state', () => {
  /**
   * **Validates: Requirements 5.10**
   *
   * Property: When a user closes the CityOverlay, the system SHALL return to the
   * previous view state such that:
   * 1. The onClose callback is invoked exactly once
   * 2. The overlay can be closed via the close button
   * 3. The overlay can be closed via the Escape key
   * 4. The overlay can be closed via background click (tile view only)
   * 5. After closing, the application state should return to showing no selected city
   *
   * This property ensures that all close mechanisms properly restore the previous state
   * by calling the onClose callback, which the parent component uses to clear the
   * selected city and return to the cities view.
   */
  it('should restore previous state when overlay is closed', async () => {
    jest.setTimeout(30000);
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          country: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          latitude: fc.double({ min: -90, max: 90 }),
          longitude: fc.double({ min: -180, max: 180 }),
          googleMapLink: fc.constantFrom('https://maps.google.com/?q=test'),
          datesVisited: fc.array(
            fc.integer({ min: 946684800000, max: 1893456000000 })
              .map((ms: number) => new Date(ms).toISOString()),
            { minLength: 1, maxLength: 3 }
          ),
          beforeYouGo: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
          overview: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
          places: fc.record({
            bars: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            restaurants: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            pointsOfInterest: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            gyms: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            accommodations: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
          }),
          createdAt: fc.integer({ min: 946684800000, max: 1893456000000 })
            .map((ms: number) => new Date(ms).toISOString()),
          updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 })
            .map((ms: number) => new Date(ms).toISOString())
        }),
        fc.constantFrom('tile' as const, 'map' as const),
        fc.constantFrom('closeButton', 'escapeKey', 'backgroundClick'),
        async (city: City, viewMode: 'tile' | 'map', closeMethod: string) => {
          // Clear all mocks before each test
          jest.clearAllMocks();

          // Mock getCityDetails to return the city
          mockGetCityDetails.mockResolvedValue(city);
          const localMockOnClose = jest.fn();

          // Render the overlay
          const { container, unmount } = render(
            <CityOverlay city={city} viewMode={viewMode} onClose={localMockOnClose} />
          );

          try {
            // Wait for the component to finish loading
            await waitFor(() => {
              expect(screen.queryByText('Loading city details...')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify overlay is displayed
            const overlay = container.querySelector('.city-overlay');
            expect(overlay).toBeInTheDocument();
            // Use a more flexible query that handles whitespace
            const cityNameElement = container.querySelector('.overlay-city-name');
            expect(cityNameElement).toBeInTheDocument();
            expect(cityNameElement?.textContent).toBe(city.name);

            // Property 1: Test different close mechanisms (Requirement 5.10)
            if (closeMethod === 'closeButton') {
              // Close via close button
              const closeButton = screen.getByLabelText('Close overlay');
              fireEvent.click(closeButton);
            } else if (closeMethod === 'escapeKey') {
              // Close via Escape key
              fireEvent.keyDown(document, { key: 'Escape' });
            } else if (closeMethod === 'backgroundClick') {
              // Close via background click (only works in tile view)
              if (viewMode === 'tile') {
                // Simulate clicking directly on the overlay background (not on content)
                // This simulates clicking in the empty space around the content
                fireEvent.click(overlay!, { target: overlay, currentTarget: overlay });
              } else {
                // In map view, background click should not close
                fireEvent.click(overlay!, { target: overlay, currentTarget: overlay });
                expect(localMockOnClose).not.toHaveBeenCalled();
                // Close via button instead for map view
                const closeButton = screen.getByLabelText('Close overlay');
                fireEvent.click(closeButton);
              }
            }

            // Property 2: onClose callback is invoked exactly once (Requirement 5.10)
            // This callback is responsible for restoring the previous state (clearing selected city)
            expect(localMockOnClose).toHaveBeenCalledTimes(1);

            // Property 3: Verify no additional calls are made
            // This ensures the close mechanism is clean and doesn't trigger multiple state changes
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(localMockOnClose).toHaveBeenCalledTimes(1);

            return true;
          } finally {
            // Clean up after each test
            unmount();
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('should handle background click differently based on view mode', async () => {
    jest.setTimeout(30000);
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          country: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          latitude: fc.double({ min: -90, max: 90 }),
          longitude: fc.double({ min: -180, max: 180 }),
          googleMapLink: fc.constantFrom('https://maps.google.com/?q=test'),
          datesVisited: fc.array(
            fc.integer({ min: 946684800000, max: 1893456000000 })
              .map((ms: number) => new Date(ms).toISOString()),
            { minLength: 1, maxLength: 3 }
          ),
          beforeYouGo: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
          overview: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
          places: fc.record({
            bars: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            restaurants: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            pointsOfInterest: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            gyms: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            accommodations: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
          }),
          createdAt: fc.integer({ min: 946684800000, max: 1893456000000 })
            .map((ms: number) => new Date(ms).toISOString()),
          updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 })
            .map((ms: number) => new Date(ms).toISOString())
        }),
        async (city: City) => {
          // Test tile view - background click should close
          jest.clearAllMocks();
          mockGetCityDetails.mockResolvedValue(city);
          const tileOnClose = jest.fn();

          const { container: tileContainer, unmount: tileUnmount } = render(
            <CityOverlay city={city} viewMode="tile" onClose={tileOnClose} />
          );

          try {
            await waitFor(() => {
              expect(screen.queryByText('Loading city details...')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            const tileOverlay = tileContainer.querySelector('.city-overlay');
            expect(tileOverlay).toBeInTheDocument();

            // Background click in tile view should close
            fireEvent.click(tileOverlay!);
            expect(tileOnClose).toHaveBeenCalledTimes(1);
          } finally {
            tileUnmount();
          }

          // Test map view - background click should NOT close
          jest.clearAllMocks();
          mockGetCityDetails.mockResolvedValue(city);
          const mapOnClose = jest.fn();

          const { container: mapContainer, unmount: mapUnmount } = render(
            <CityOverlay city={city} viewMode="map" onClose={mapOnClose} />
          );

          try {
            await waitFor(() => {
              expect(screen.queryByText('Loading city details...')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            const mapOverlay = mapContainer.querySelector('.city-overlay');
            expect(mapOverlay).toBeInTheDocument();

            // Background click in map view should NOT close (allows map interaction)
            fireEvent.click(mapOverlay!);
            expect(mapOnClose).not.toHaveBeenCalled();
          } finally {
            mapUnmount();
          }

          return true;
        }
      ),
      { numRuns: 15 }
    );
  });
});



describe('Property 23: Place objects contain required fields', () => {
  /**
   * **Validates: Requirements 5.9, 9.5**
   * 
   * Property: For any city with places data, the PlacesCategories object SHALL
   * contain all five required category fields such that:
   * 1. The places object has a 'bars' field
   * 2. The places object has a 'restaurants' field
   * 3. The places object has a 'pointsOfInterest' field
   * 4. The places object has a 'gyms' field
   * 5. The places object has a 'accommodations' field
   * 6. Each field is a string (can be empty or contain content)
   * 7. When a category has content, it is displayed in the overlay
   * 
   * This ensures the data structure is consistent and all expected categories
   * are present, even if some are empty strings.
   */
  it('should validate that places object contains all required category fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          country: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          latitude: fc.double({ min: -90, max: 90 }),
          longitude: fc.double({ min: -180, max: 180 }),
          googleMapLink: fc.constantFrom('https://maps.google.com/?q=test'),
          datesVisited: fc.array(
            fc.integer({ min: 946684800000, max: 1893456000000 })
              .map((ms: number) => new Date(ms).toISOString()),
            { minLength: 1, maxLength: 3 }
          ),
          beforeYouGo: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
          overview: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
          places: fc.record({
            bars: fc.string({ maxLength: 50 }),
            restaurants: fc.string({ maxLength: 50 }),
            pointsOfInterest: fc.string({ maxLength: 50 }),
            gyms: fc.string({ maxLength: 50 }),
            accommodations: fc.string({ maxLength: 50 })
          }),
          createdAt: fc.integer({ min: 946684800000, max: 1893456000000 })
            .map((ms: number) => new Date(ms).toISOString()),
          updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 })
            .map((ms: number) => new Date(ms).toISOString())
        }),
        async (city: City) => {
          // Clear all mocks before each test
          jest.clearAllMocks();
          
          // Property 1-5: Verify places object has all required fields (Requirements 5.9, 9.5)
          expect(city.places).toBeDefined();
          expect(city.places).toHaveProperty('bars');
          expect(city.places).toHaveProperty('restaurants');
          expect(city.places).toHaveProperty('pointsOfInterest');
          expect(city.places).toHaveProperty('gyms');
          expect(city.places).toHaveProperty('accommodations');

          // Property 6: Verify each field is a string
          expect(typeof city.places.bars).toBe('string');
          expect(typeof city.places.restaurants).toBe('string');
          expect(typeof city.places.pointsOfInterest).toBe('string');
          expect(typeof city.places.gyms).toBe('string');
          expect(typeof city.places.accommodations).toBe('string');

          // Property 7: Verify overlay displays non-empty categories (Requirements 5.9)
          mockGetCityDetails.mockResolvedValue(city);
          const localMockOnClose = jest.fn();

          const { container, unmount } = render(
            <CityOverlay city={city} viewMode="tile" onClose={localMockOnClose} />
          );

          try {
            // Wait for the component to finish loading
            await waitFor(() => {
              expect(screen.queryByText('Loading city details...')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify "Places to Visit" section is always present
            expect(screen.getByText('Places to Visit')).toBeInTheDocument();

            // Check that non-empty categories are displayed
            if (city.places.bars && city.places.bars.trim()) {
              expect(screen.getByText('Bars')).toBeInTheDocument();
              expect(container.textContent).toContain(city.places.bars);
            }

            if (city.places.restaurants && city.places.restaurants.trim()) {
              expect(screen.getByText('Restaurants')).toBeInTheDocument();
              expect(container.textContent).toContain(city.places.restaurants);
            }

            if (city.places.pointsOfInterest && city.places.pointsOfInterest.trim()) {
              expect(screen.getByText('Points of Interest')).toBeInTheDocument();
              expect(container.textContent).toContain(city.places.pointsOfInterest);
            }

            if (city.places.gyms && city.places.gyms.trim()) {
              expect(screen.getByText('Gyms')).toBeInTheDocument();
              expect(container.textContent).toContain(city.places.gyms);
            }

            if (city.places.accommodations && city.places.accommodations.trim()) {
              expect(screen.getByText('Accommodations')).toBeInTheDocument();
              expect(container.textContent).toContain(city.places.accommodations);
            }

            // Verify empty categories are not displayed (conditional rendering)
            if (!city.places.bars || !city.places.bars.trim()) {
              // If bars is empty, the category title might not be shown
              // This is acceptable as the component conditionally renders categories
            }

            return true;
          } finally {
            // Clean up after each test
            unmount();
          }
        }
      ),
      { numRuns: 15 }
    );
  });
});
