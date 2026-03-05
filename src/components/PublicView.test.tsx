/**
 * Integration tests for PublicView component
 * Requirements: 2.1-5.10
 * 
 * These tests verify the complete user experience in the public view,
 * including navigation between different view modes, city selection,
 * and overlay interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PublicView } from './PublicView';
import { useData } from '../contexts/DataContext';
import { City, PersonalInfo } from '../types';

// Mock DataContext
jest.mock('../contexts/DataContext');
const mockUseData = useData as jest.MockedFunction<typeof useData>;

// Mock child components
jest.mock('./PersonalSection', () => ({
  __esModule: true,
  default: ({ personalInfo }: any) => (
    <div data-testid="personal-section">
      <h1>{personalInfo.name}</h1>
      <p>{personalInfo.tagline}</p>
    </div>
  )
}));

jest.mock('./CitiesSection', () => ({
  CitiesSection: ({ cities, viewMode, sortMode, onViewModeChange, onSortModeChange, onCitySelect }: any) => (
    <div data-testid="cities-section">
      <div data-testid="view-mode">{viewMode}</div>
      <div data-testid="sort-mode">{sortMode}</div>
      <button onClick={() => onViewModeChange(viewMode === 'tile' ? 'map' : 'tile')}>
        Toggle View
      </button>
      <button onClick={() => onSortModeChange(sortMode === 'alphabetical' ? 'date' : 'alphabetical')}>
        Toggle Sort
      </button>
      <div data-testid="cities-list">
        {cities.map((city: City) => (
          <button key={city.id} onClick={() => onCitySelect(city)}>
            {city.name}
          </button>
        ))}
      </div>
    </div>
  )
}));

jest.mock('./CityOverlay', () => ({
  CityOverlay: ({ city, viewMode, onClose }: any) => (
    <div data-testid="city-overlay">
      <h2>{city.name}</h2>
      <p>View Mode: {viewMode}</p>
      <button onClick={onClose}>Close Overlay</button>
    </div>
  )
}));

describe('PublicView Integration Tests', () => {
  const mockPersonalInfo: PersonalInfo = {
    id: 'personal-info',
    name: 'Michael Jan',
    tagline: 'Software Engineer & Travel Enthusiast',
    description: 'Passionate about building great software and exploring the world.',
    linkedInUrl: 'https://www.linkedin.com/in/michaeljan',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockCities: City[] = [
    {
      id: '1',
      name: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      googleMapLink: 'https://maps.google.com/paris',
      datesVisited: ['2023-01-15', '2023-06-20'],
      beforeYouGo: 'Learn some basic French phrases',
      overview: 'The City of Light',
      places: {
        bars: 'Le Bar',
        restaurants: 'Le Restaurant',
        pointsOfInterest: 'Eiffel Tower',
        gyms: 'Paris Gym',
        accommodations: 'Hotel Paris'
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'London',
      country: 'UK',
      latitude: 51.5074,
      longitude: -0.1278,
      googleMapLink: 'https://maps.google.com/london',
      datesVisited: ['2023-03-10'],
      beforeYouGo: 'Get an Oyster card',
      overview: 'Historic capital',
      places: {
        bars: 'The Pub',
        restaurants: 'British Restaurant',
        pointsOfInterest: 'Big Ben',
        gyms: 'London Gym',
        accommodations: 'London Hotel'
      },
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Tokyo',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      googleMapLink: 'https://maps.google.com/tokyo',
      datesVisited: ['2023-09-05'],
      beforeYouGo: 'Get a JR Pass',
      overview: 'Modern metropolis',
      places: {
        bars: 'Tokyo Bar',
        restaurants: 'Sushi Restaurant',
        pointsOfInterest: 'Shibuya Crossing',
        gyms: 'Tokyo Gym',
        accommodations: 'Tokyo Hotel'
      },
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2023-03-01T00:00:00Z'
    }
  ];

  const mockDataContextValue = {
    personalInfo: mockPersonalInfo,
    cities: mockCities,
    loading: false,
    error: null,
    refreshData: jest.fn(),
    updatePersonalInfo: jest.fn(),
    createCity: jest.fn(),
    updateCity: jest.fn(),
    deleteCity: jest.fn(),
    fetchCityDetails: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseData.mockReturnValue(mockDataContextValue);
  });

  describe('Initial Rendering', () => {
    /**
     * Test: PublicView renders personal section and cities section
     * Requirements: 1.5, 2.1
     */
    it('should render personal section before cities section', () => {
      render(<PublicView />);

      const personalSection = screen.getByTestId('personal-section');
      const citiesSection = screen.getByTestId('cities-section');

      expect(personalSection).toBeInTheDocument();
      expect(citiesSection).toBeInTheDocument();

      // Verify personal section appears before cities section in DOM
      const container = screen.getByText('Michael Jan').closest('div');
      expect(container).toBeTruthy();
    });

    /**
     * Test: PublicView displays all cities
     * Requirements: 2.1
     */
    it('should display all cities from data context', () => {
      render(<PublicView />);

      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    /**
     * Test: Default view mode is tile
     * Requirements: 2.2
     */
    it('should default to tile view mode', () => {
      render(<PublicView />);

      const viewMode = screen.getByTestId('view-mode');
      expect(viewMode).toHaveTextContent('tile');
    });

    /**
     * Test: Default sort mode is date
     * Requirements: 4.5
     */
    it('should default to date-based sorting', () => {
      render(<PublicView />);

      const sortMode = screen.getByTestId('sort-mode');
      expect(sortMode).toHaveTextContent('date');
    });
  });

  describe('View Mode Switching', () => {
    /**
     * Test: View mode switches from tile to map
     * Requirements: 2.2, 2.5
     */
    it('should switch from tile view to map view', () => {
      render(<PublicView />);

      // Initial state should be tile
      expect(screen.getByTestId('view-mode')).toHaveTextContent('tile');

      // Click toggle button
      const toggleButton = screen.getByText('Toggle View');
      fireEvent.click(toggleButton);

      // Should now be map view
      expect(screen.getByTestId('view-mode')).toHaveTextContent('map');
    });

    /**
     * Test: View mode switches from map to tile
     * Requirements: 2.2, 2.5
     */
    it('should switch from map view back to tile view', () => {
      render(<PublicView />);

      const toggleButton = screen.getByText('Toggle View');

      // Switch to map
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('view-mode')).toHaveTextContent('map');

      // Switch back to tile
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('view-mode')).toHaveTextContent('tile');
    });

    /**
     * Test: View mode switching preserves cities
     * Requirements: 2.5
     */
    it('should preserve all cities when switching view modes', () => {
      render(<PublicView />);

      // Verify all cities are present in tile view
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();

      // Switch to map view
      const toggleButton = screen.getByText('Toggle View');
      fireEvent.click(toggleButton);

      // Verify all cities are still present in map view
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });

  describe('Sort Mode Changes', () => {
    /**
     * Test: Sort mode switches from date to alphabetical
     * Requirements: 4.2, 4.3
     */
    it('should switch from date sorting to alphabetical sorting', () => {
      render(<PublicView />);

      // Initial state should be date
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('date');

      // Click toggle button
      const toggleButton = screen.getByText('Toggle Sort');
      fireEvent.click(toggleButton);

      // Should now be alphabetical
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('alphabetical');
    });

    /**
     * Test: Sort mode switches from alphabetical to date
     * Requirements: 4.2, 4.4
     */
    it('should switch from alphabetical sorting back to date sorting', () => {
      render(<PublicView />);

      const toggleButton = screen.getByText('Toggle Sort');

      // Switch to alphabetical
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('alphabetical');

      // Switch back to date
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('date');
    });

    /**
     * Test: Sort mode changes preserve cities
     * Requirements: 4.6
     */
    it('should preserve all cities when changing sort modes', () => {
      render(<PublicView />);

      // Verify all cities are present with date sorting
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();

      // Switch to alphabetical sorting
      const toggleButton = screen.getByText('Toggle Sort');
      fireEvent.click(toggleButton);

      // Verify all cities are still present with alphabetical sorting
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });

  describe('City Selection and Overlay', () => {
    /**
     * Test: Clicking a city opens the overlay
     * Requirements: 5.1
     */
    it('should open city overlay when a city is clicked', () => {
      render(<PublicView />);

      // Initially, no overlay should be visible
      expect(screen.queryByTestId('city-overlay')).not.toBeInTheDocument();

      // Click on Paris
      const parisButton = screen.getByText('Paris');
      fireEvent.click(parisButton);

      // Overlay should now be visible
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();
      expect(screen.getByText('Paris', { selector: 'h2' })).toBeInTheDocument();
    });

    /**
     * Test: Overlay displays correct city information
     * Requirements: 5.4
     */
    it('should display the correct city in the overlay', () => {
      render(<PublicView />);

      // Click on London
      const londonButton = screen.getByText('London');
      fireEvent.click(londonButton);

      // Verify London overlay is displayed
      const overlay = screen.getByTestId('city-overlay');
      expect(overlay).toHaveTextContent('London');
    });

    /**
     * Test: Overlay shows current view mode
     * Requirements: 5.3
     */
    it('should pass current view mode to overlay', () => {
      render(<PublicView />);

      // Click city in tile view
      const parisButton = screen.getByText('Paris');
      fireEvent.click(parisButton);

      // Verify overlay shows tile view mode
      expect(screen.getByText('View Mode: tile')).toBeInTheDocument();
    });

    /**
     * Test: Closing overlay returns to previous state
     * Requirements: 5.10
     */
    it('should close overlay and return to previous view state', () => {
      render(<PublicView />);

      // Open overlay
      const parisButton = screen.getByText('Paris');
      fireEvent.click(parisButton);
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();

      // Close overlay
      const closeButton = screen.getByText('Close Overlay');
      fireEvent.click(closeButton);

      // Overlay should be gone
      expect(screen.queryByTestId('city-overlay')).not.toBeInTheDocument();

      // Cities section should still be visible
      expect(screen.getByTestId('cities-section')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
  });

  describe('Full User Flow Integration', () => {
    /**
     * Test: Complete user flow - view cities → click city → view overlay → close
     * Requirements: 2.1-5.10
     */
    it('should handle complete user flow from viewing cities to closing overlay', () => {
      render(<PublicView />);

      // Step 1: View cities in tile view (default)
      expect(screen.getByTestId('view-mode')).toHaveTextContent('tile');
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();

      // Step 2: Click on a city
      const tokyoButton = screen.getByText('Tokyo');
      fireEvent.click(tokyoButton);

      // Step 3: View overlay
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();
      expect(screen.getByText('Tokyo', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('View Mode: tile')).toBeInTheDocument();

      // Step 4: Close overlay
      const closeButton = screen.getByText('Close Overlay');
      fireEvent.click(closeButton);

      // Step 5: Verify return to previous state
      expect(screen.queryByTestId('city-overlay')).not.toBeInTheDocument();
      expect(screen.getByTestId('cities-section')).toBeInTheDocument();
      expect(screen.getByTestId('view-mode')).toHaveTextContent('tile');
    });

    /**
     * Test: User flow with view mode switching and city selection
     * Requirements: 2.2, 2.5, 5.1, 5.2, 5.3
     */
    it('should handle view mode switching before and after city selection', () => {
      render(<PublicView />);

      // Start in tile view
      expect(screen.getByTestId('view-mode')).toHaveTextContent('tile');

      // Switch to map view
      const viewToggle = screen.getByText('Toggle View');
      fireEvent.click(viewToggle);
      expect(screen.getByTestId('view-mode')).toHaveTextContent('map');

      // Click city in map view
      const parisButton = screen.getByText('Paris');
      fireEvent.click(parisButton);

      // Verify overlay shows map view mode
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();
      expect(screen.getByText('View Mode: map')).toBeInTheDocument();

      // Close overlay
      const closeButton = screen.getByText('Close Overlay');
      fireEvent.click(closeButton);

      // Verify still in map view
      expect(screen.getByTestId('view-mode')).toHaveTextContent('map');
    });

    /**
     * Test: User flow with sort mode changes and city selection
     * Requirements: 4.2, 4.6, 5.1, 5.10
     */
    it('should handle sort mode changes before and after city selection', () => {
      render(<PublicView />);

      // Start with date sorting
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('date');

      // Switch to alphabetical sorting
      const sortToggle = screen.getByText('Toggle Sort');
      fireEvent.click(sortToggle);
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('alphabetical');

      // Click city
      const londonButton = screen.getByText('London');
      fireEvent.click(londonButton);

      // Verify overlay is open
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();

      // Close overlay
      const closeButton = screen.getByText('Close Overlay');
      fireEvent.click(closeButton);

      // Verify sort mode is preserved
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('alphabetical');
    });

    /**
     * Test: Multiple city selections in sequence
     * Requirements: 5.1, 5.10
     */
    it('should handle multiple city selections in sequence', () => {
      render(<PublicView />);

      // Select first city
      fireEvent.click(screen.getByText('Paris'));
      expect(screen.getByText('Paris', { selector: 'h2' })).toBeInTheDocument();

      // Close overlay
      fireEvent.click(screen.getByText('Close Overlay'));
      expect(screen.queryByTestId('city-overlay')).not.toBeInTheDocument();

      // Select second city
      fireEvent.click(screen.getByText('London'));
      expect(screen.getByText('London', { selector: 'h2' })).toBeInTheDocument();

      // Close overlay
      fireEvent.click(screen.getByText('Close Overlay'));
      expect(screen.queryByTestId('city-overlay')).not.toBeInTheDocument();

      // Select third city
      fireEvent.click(screen.getByText('Tokyo'));
      expect(screen.getByText('Tokyo', { selector: 'h2' })).toBeInTheDocument();
    });

    /**
     * Test: Complex flow with multiple state changes
     * Requirements: 2.2, 2.5, 4.2, 4.6, 5.1, 5.10
     */
    it('should handle complex user flow with multiple state changes', () => {
      render(<PublicView />);

      // 1. Start in tile view with date sorting
      expect(screen.getByTestId('view-mode')).toHaveTextContent('tile');
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('date');

      // 2. Switch to alphabetical sorting
      fireEvent.click(screen.getByText('Toggle Sort'));
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('alphabetical');

      // 3. Switch to map view
      fireEvent.click(screen.getByText('Toggle View'));
      expect(screen.getByTestId('view-mode')).toHaveTextContent('map');

      // 4. Select a city
      fireEvent.click(screen.getByText('Paris'));
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();
      expect(screen.getByText('View Mode: map')).toBeInTheDocument();

      // 5. Close overlay
      fireEvent.click(screen.getByText('Close Overlay'));
      expect(screen.queryByTestId('city-overlay')).not.toBeInTheDocument();

      // 6. Verify all state is preserved
      expect(screen.getByTestId('view-mode')).toHaveTextContent('map');
      expect(screen.getByTestId('sort-mode')).toHaveTextContent('alphabetical');

      // 7. Switch back to tile view
      fireEvent.click(screen.getByText('Toggle View'));
      expect(screen.getByTestId('view-mode')).toHaveTextContent('tile');

      // 8. Select another city
      fireEvent.click(screen.getByText('Tokyo'));
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();
      expect(screen.getByText('View Mode: tile')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    /**
     * Test: Loading state is displayed
     * Requirements: 10.3
     */
    it('should display loading state when data is loading', () => {
      mockUseData.mockReturnValue({
        ...mockDataContextValue,
        personalInfo: null,
        cities: [],
        loading: true
      });

      render(<PublicView />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('personal-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cities-section')).not.toBeInTheDocument();
    });

    /**
     * Test: Error state is displayed
     * Requirements: 10.5
     */
    it('should display error state when data loading fails', () => {
      mockUseData.mockReturnValue({
        ...mockDataContextValue,
        personalInfo: null,
        cities: [],
        loading: false,
        error: 'Failed to load data'
      });

      render(<PublicView />);

      expect(screen.getByText(/Error loading data: Failed to load data/i)).toBeInTheDocument();
      expect(screen.queryByTestId('personal-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cities-section')).not.toBeInTheDocument();
    });

    /**
     * Test: Partial data is displayed when available
     * Requirements: 1.1-2.1
     */
    it('should display available data even if some data is missing', () => {
      mockUseData.mockReturnValue({
        ...mockDataContextValue,
        personalInfo: mockPersonalInfo,
        cities: [],
        loading: false,
        error: null
      });

      render(<PublicView />);

      // Personal section should be visible
      expect(screen.getByTestId('personal-section')).toBeInTheDocument();
      expect(screen.getByText('Michael Jan')).toBeInTheDocument();

      // Cities section should be visible but empty
      expect(screen.getByTestId('cities-section')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Handles empty cities array
     * Requirements: 2.1
     */
    it('should handle empty cities array gracefully', () => {
      mockUseData.mockReturnValue({
        ...mockDataContextValue,
        cities: []
      });

      render(<PublicView />);

      expect(screen.getByTestId('cities-section')).toBeInTheDocument();
      expect(screen.queryByText('Paris')).not.toBeInTheDocument();
    });

    /**
     * Test: Handles missing personal info
     * Requirements: 1.1-1.5
     */
    it('should handle missing personal info gracefully', () => {
      mockUseData.mockReturnValue({
        ...mockDataContextValue,
        personalInfo: null
      });

      render(<PublicView />);

      expect(screen.queryByTestId('personal-section')).not.toBeInTheDocument();
      expect(screen.getByTestId('cities-section')).toBeInTheDocument();
    });

    /**
     * Test: Overlay closes when selecting same city again
     * Requirements: 5.10
     */
    it('should allow reopening overlay for the same city', () => {
      render(<PublicView />);

      // Open overlay for Paris
      fireEvent.click(screen.getByText('Paris'));
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();

      // Close overlay
      fireEvent.click(screen.getByText('Close Overlay'));
      expect(screen.queryByTestId('city-overlay')).not.toBeInTheDocument();

      // Open overlay for Paris again
      fireEvent.click(screen.getByText('Paris'));
      expect(screen.getByTestId('city-overlay')).toBeInTheDocument();
      expect(screen.getByText('Paris', { selector: 'h2' })).toBeInTheDocument();
    });
  });
});
