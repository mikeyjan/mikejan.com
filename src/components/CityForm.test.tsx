/**
 * Unit tests for CityForm component
 * Requirements: 8.2-8.10, 9.1-9.7
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CityForm from './CityForm';
import { City, CreateCityRequest } from '../types';

/**
 * Mock city data for edit mode
 */
const mockCity: City = {
  id: 'city-1',
  name: 'Paris',
  country: 'France',
  latitude: 48.8566,
  longitude: 2.3522,
  googleMapLink: 'https://maps.google.com/paris',
  datesVisited: ['June 2023', 'December 2023'],
  beforeYouGo: 'Learn some basic French phrases',
  overview: 'The City of Light is known for its art, fashion, and culture',
  places: {
    bars: 'Le Bar, Café de Flore',
    restaurants: 'Le Jules Verne, L\'Ami Jean',
    pointsOfInterest: 'Eiffel Tower, Louvre Museum',
    gyms: 'Fitness Park, Basic Fit',
    accommodations: 'Hotel Plaza Athénée'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

/**
 * Mock DataContext
 */
const mockCreateCity = jest.fn();
const mockUpdateCity = jest.fn();
const mockDataContext = {
  personalInfo: null,
  cities: [],
  loading: false,
  error: null,
  refreshData: jest.fn(),
  getCityDetails: jest.fn(),
  updatePersonalInfo: jest.fn(),
  createCity: mockCreateCity,
  updateCity: mockUpdateCity,
  deleteCity: jest.fn()
};

// Mock the DataContext module
jest.mock('../contexts/DataContext', () => ({
  useData: () => mockDataContext
}));

describe('CityForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateCity.mockReset();
    mockUpdateCity.mockReset();
  });

  /**
   * Test: Component renders in create mode
   * Requirements: 8.2
   */
  test('renders form in create mode with all fields', () => {
    render(<CityForm />);

    // Check title
    expect(screen.getByText('Add New City')).toBeInTheDocument();

    // Check all basic fields are present
    expect(screen.getByLabelText(/city name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/google map link/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dates visited/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/before you go/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/overview/i)).toBeInTheDocument();

    // Check place category fields
    expect(screen.getByLabelText(/bars/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/restaurants/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/points of interest/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gyms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/accommodations/i)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByRole('button', { name: /create city/i })).toBeInTheDocument();
  });

  /**
   * Test: Component renders in edit mode with populated data
   * Requirements: 8.4
   */
  test('renders form in edit mode with city data populated', () => {
    render(<CityForm city={mockCity} />);

    // Check title
    expect(screen.getByText('Edit City')).toBeInTheDocument();

    // Check fields are populated
    expect(screen.getByDisplayValue(mockCity.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCity.country)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCity.latitude.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCity.longitude.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCity.googleMapLink)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCity.beforeYouGo)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCity.overview)).toBeInTheDocument();

    // Check dates are displayed
    mockCity.datesVisited.forEach(date => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });

    // Check places are populated
    expect(screen.getByDisplayValue(mockCity.places.bars)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockCity.places.restaurants)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByRole('button', { name: /update city/i })).toBeInTheDocument();
  });

  /**
   * Test: Validation errors for required fields
   * Requirements: 8.8
   */
  test('displays validation errors for empty required fields', async () => {
    render(<CityForm />);

    // Submit form without filling any fields
    const submitButton = screen.getByRole('button', { name: /create city/i });
    fireEvent.click(submitButton);

    // Check validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/city name is required/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/country is required/i)).toBeInTheDocument();
    expect(screen.getByText(/google map link is required/i)).toBeInTheDocument();
    expect(screen.getByText(/at least one visit date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/before you go section is required/i)).toBeInTheDocument();
    expect(screen.getByText(/overview is required/i)).toBeInTheDocument();
  });

  /**
   * Test: Validation for field length constraints
   * Requirements: 8.8
   */
  test('displays validation errors for field length constraints', async () => {
    render(<CityForm />);

    // Test city name too short
    const nameInput = screen.getByLabelText(/city name/i);
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    await waitFor(() => {
      expect(screen.getByText(/city name must be at least 2 characters/i)).toBeInTheDocument();
    });

    // Test before you go too short
    fireEvent.change(nameInput, { target: { value: 'Paris' } });
    const beforeYouGoInput = screen.getByLabelText(/before you go/i);
    fireEvent.change(beforeYouGoInput, { target: { value: 'Short' } });
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    await waitFor(() => {
      expect(screen.getByText(/before you go must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Validation for invalid Google Map URL
   * Requirements: 8.8
   */
  test('displays validation error for invalid Google Map URL', async () => {
    render(<CityForm />);

    const urlInput = screen.getByLabelText(/google map link/i);
    
    // Test invalid URL
    fireEvent.change(urlInput, { target: { value: 'not-a-url' } });
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Adding and removing dates
   * Requirements: 9.3
   */
  test('allows adding and removing visit dates', () => {
    render(<CityForm />);

    const dateInput = screen.getByLabelText(/dates visited/i);
    const addButton = screen.getByRole('button', { name: /add date/i });

    // Add first date
    fireEvent.change(dateInput, { target: { value: 'June 2023' } });
    fireEvent.click(addButton);

    expect(screen.getByText('June 2023')).toBeInTheDocument();
    expect(dateInput).toHaveValue('');

    // Add second date
    fireEvent.change(dateInput, { target: { value: 'December 2023' } });
    fireEvent.click(addButton);

    expect(screen.getByText('December 2023')).toBeInTheDocument();

    // Remove first date
    const removeButtons = screen.getAllByLabelText(/remove date/i);
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('June 2023')).not.toBeInTheDocument();
    expect(screen.getByText('December 2023')).toBeInTheDocument();
  });

  /**
   * Test: Adding date with Enter key
   * Requirements: 9.3
   */
  test('allows adding date by pressing Enter key', () => {
    render(<CityForm />);

    const dateInput = screen.getByLabelText(/dates visited/i);

    // Add date with Enter key
    fireEvent.change(dateInput, { target: { value: 'June 2023' } });
    fireEvent.keyPress(dateInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(screen.getByText('June 2023')).toBeInTheDocument();
    expect(dateInput).toHaveValue('');
  });

  /**
   * Test: Manual coordinates toggle
   * Requirements: 8.10
   */
  test('allows toggling between automatic and manual coordinates', () => {
    render(<CityForm />);

    // Initially, manual coordinate fields should not be visible
    expect(screen.queryByLabelText(/^latitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^longitude/i)).not.toBeInTheDocument();

    // Click toggle button
    const toggleButton = screen.getByRole('button', { name: /enter manually/i });
    fireEvent.click(toggleButton);

    // Manual coordinate fields should now be visible
    expect(screen.getByLabelText(/^latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^longitude/i)).toBeInTheDocument();

    // Toggle back
    const autoButton = screen.getByRole('button', { name: /use automatic geocoding/i });
    fireEvent.click(autoButton);

    // Manual coordinate fields should be hidden again
    expect(screen.queryByLabelText(/^latitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^longitude/i)).not.toBeInTheDocument();
  });

  /**
   * Test: Coordinate validation when manual mode is enabled
   * Requirements: 8.10
   */
  test('validates coordinates when manual mode is enabled', async () => {
    render(<CityForm />);

    // Enable manual coordinates
    const toggleButton = screen.getByRole('button', { name: /enter manually/i });
    fireEvent.click(toggleButton);

    // Enter invalid latitude
    const latInput = screen.getByLabelText(/^latitude/i);
    const lonInput = screen.getByLabelText(/^longitude/i);
    
    fireEvent.change(latInput, { target: { value: '100' } });
    fireEvent.change(lonInput, { target: { value: '200' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    await waitFor(() => {
      expect(screen.getByText(/latitude must be between -90 and 90/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/longitude must be between -180 and 180/i)).toBeInTheDocument();
  });

  /**
   * Test: Successful city creation
   * Requirements: 8.3
   */
  test('successfully creates a new city', async () => {
    const newCityData: CreateCityRequest = {
      name: 'Tokyo',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      googleMapLink: 'https://maps.google.com/tokyo',
      datesVisited: ['March 2024'],
      beforeYouGo: 'Learn basic Japanese greetings',
      overview: 'A vibrant metropolis blending tradition and modernity',
      places: {
        bars: 'Golden Gai',
        restaurants: 'Sukiyabashi Jiro',
        pointsOfInterest: 'Tokyo Tower, Senso-ji Temple',
        gyms: 'Anytime Fitness',
        accommodations: 'Park Hyatt Tokyo'
      }
    };

    mockCreateCity.mockResolvedValueOnce(undefined);

    render(<CityForm onSuccess={jest.fn()} />);

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/city name/i), { target: { value: newCityData.name } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: newCityData.country } });
    fireEvent.change(screen.getByLabelText(/google map link/i), { target: { value: newCityData.googleMapLink } });
    fireEvent.change(screen.getByLabelText(/before you go/i), { target: { value: newCityData.beforeYouGo } });
    fireEvent.change(screen.getByLabelText(/overview/i), { target: { value: newCityData.overview } });

    // Add date
    const dateInput = screen.getByLabelText(/dates visited/i);
    fireEvent.change(dateInput, { target: { value: newCityData.datesVisited[0] } });
    fireEvent.click(screen.getByRole('button', { name: /add date/i }));

    // Fill in place categories
    fireEvent.change(screen.getByLabelText(/bars/i), { target: { value: newCityData.places.bars } });
    fireEvent.change(screen.getByLabelText(/restaurants/i), { target: { value: newCityData.places.restaurants } });
    fireEvent.change(screen.getByLabelText(/points of interest/i), { target: { value: newCityData.places.pointsOfInterest } });
    fireEvent.change(screen.getByLabelText(/gyms/i), { target: { value: newCityData.places.gyms } });
    fireEvent.change(screen.getByLabelText(/accommodations/i), { target: { value: newCityData.places.accommodations } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    // Check success message
    await waitFor(() => {
      expect(screen.getByText(/city created successfully/i)).toBeInTheDocument();
    });

    // Verify createCity was called
    expect(mockCreateCity).toHaveBeenCalledWith(expect.objectContaining({
      name: newCityData.name,
      country: newCityData.country,
      googleMapLink: newCityData.googleMapLink,
      datesVisited: newCityData.datesVisited,
      beforeYouGo: newCityData.beforeYouGo,
      overview: newCityData.overview,
      places: newCityData.places
    }));
  });

  /**
   * Test: Successful city update
   * Requirements: 8.5
   */
  test('successfully updates an existing city', async () => {
    mockUpdateCity.mockResolvedValueOnce(undefined);

    render(<CityForm city={mockCity} onSuccess={jest.fn()} />);

    // Modify city name
    const nameInput = screen.getByLabelText(/city name/i);
    fireEvent.change(nameInput, { target: { value: 'Paris Updated' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /update city/i }));

    // Check success message
    await waitFor(() => {
      expect(screen.getByText(/city updated successfully/i)).toBeInTheDocument();
    });

    // Verify updateCity was called with city ID
    expect(mockUpdateCity).toHaveBeenCalledWith(
      mockCity.id,
      expect.objectContaining({
        name: 'Paris Updated'
      })
    );
  });

  /**
   * Test: Error handling for failed save
   * Requirements: 8.8
   */
  test('displays error message when save operation fails', async () => {
    mockCreateCity.mockRejectedValueOnce(new Error('Failed to create city'));

    render(<CityForm />);

    // Fill in minimum required fields
    fireEvent.change(screen.getByLabelText(/city name/i), { target: { value: 'Tokyo' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Japan' } });
    fireEvent.change(screen.getByLabelText(/google map link/i), { target: { value: 'https://maps.google.com/tokyo' } });
    fireEvent.change(screen.getByLabelText(/before you go/i), { target: { value: 'Learn basic Japanese' } });
    fireEvent.change(screen.getByLabelText(/overview/i), { target: { value: 'A vibrant metropolis' } });

    // Add date
    const dateInput = screen.getByLabelText(/dates visited/i);
    fireEvent.change(dateInput, { target: { value: 'March 2024' } });
    fireEvent.click(screen.getByRole('button', { name: /add date/i }));

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create city/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Geocoding failure handling
   * Requirements: 8.10
   */
  test('handles geocoding failure with appropriate error message', async () => {
    // Mock error that includes "coordinates" keyword to trigger geocoding error handling
    mockCreateCity.mockRejectedValueOnce(new Error('Failed to determine coordinates'));

    render(<CityForm />);

    // Fill in minimum required fields
    fireEvent.change(screen.getByLabelText(/city name/i), { target: { value: 'Unknown City' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Unknown' } });
    fireEvent.change(screen.getByLabelText(/google map link/i), { target: { value: 'https://maps.google.com/unknown' } });
    fireEvent.change(screen.getByLabelText(/before you go/i), { target: { value: 'Some travel tips' } });
    fireEvent.change(screen.getByLabelText(/overview/i), { target: { value: 'City overview text' } });

    // Add date
    const dateInput = screen.getByLabelText(/dates visited/i);
    fireEvent.change(dateInput, { target: { value: 'March 2024' } });
    fireEvent.click(screen.getByRole('button', { name: /add date/i }));

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    // Check geocoding error message with manual coordinate prompt
    await waitFor(() => {
      expect(screen.getByText(/geocoding failed.*enter coordinates manually/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Cancel button calls onCancel callback
   * Requirements: 8.2
   */
  test('calls onCancel callback when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<CityForm onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  /**
   * Test: Loading state during save
   * Requirements: 8.9
   */
  test('shows loading state during save operation', async () => {
    mockCreateCity.mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 50));
    });

    render(<CityForm />);

    // Fill in minimum required fields
    fireEvent.change(screen.getByLabelText(/city name/i), { target: { value: 'Tokyo' } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Japan' } });
    fireEvent.change(screen.getByLabelText(/google map link/i), { target: { value: 'https://maps.google.com/tokyo' } });
    fireEvent.change(screen.getByLabelText(/before you go/i), { target: { value: 'Learn basic Japanese' } });
    fireEvent.change(screen.getByLabelText(/overview/i), { target: { value: 'A vibrant metropolis' } });

    // Add date
    const dateInput = screen.getByLabelText(/dates visited/i);
    fireEvent.change(dateInput, { target: { value: 'March 2024' } });
    fireEvent.click(screen.getByRole('button', { name: /add date/i }));

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create city/i });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    }, { timeout: 100 });

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText(/city created successfully/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Validation error clears when user modifies field
   * Requirements: 8.8
   */
  test('clears validation error when user modifies field', async () => {
    render(<CityForm />);

    // Submit to trigger validation errors
    fireEvent.click(screen.getByRole('button', { name: /create city/i }));

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText(/city name is required/i)).toBeInTheDocument();
    });

    // Start typing in name field
    const nameInput = screen.getByLabelText(/city name/i);
    fireEvent.change(nameInput, { target: { value: 'P' } });

    // Validation error should be cleared
    expect(screen.queryByText(/city name is required/i)).not.toBeInTheDocument();
  });
});

/**
 * Property-based tests for CityForm validation
 */
import * as fc from 'fast-check';
import { cleanup } from '@testing-library/react';

describe('CityForm Property Tests', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Property 19: Invalid city data shows validation errors
   * Validates: Requirements 8.8
   */
  test('Property 19: Invalid city data shows validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.oneof(
            fc.constantFrom('', '   '),
            fc.string({ minLength: 1, maxLength: 1 })
          ),
          country: fc.constantFrom('', '   '),
          googleMapLink: fc.constantFrom('', 'not-a-url', 'ftp://invalid.com'),
          beforeYouGo: fc.oneof(
            fc.constantFrom(''),
            fc.string({ minLength: 1, maxLength: 9 })
          ),
          overview: fc.constantFrom(''),
          datesVisited: fc.constantFrom([] as string[])
        }),
        async (invalidData) => {
          const { unmount } = render(<CityForm />);

          try {
            // Fill form with invalid data
            if (invalidData.name !== undefined) {
              const nameInput = screen.getByLabelText(/city name/i);
              fireEvent.change(nameInput, { target: { value: invalidData.name } });
            }

            if (invalidData.country !== undefined) {
              const countryInput = screen.getByLabelText(/country/i);
              fireEvent.change(countryInput, { target: { value: invalidData.country } });
            }

            if (invalidData.googleMapLink !== undefined) {
              const urlInput = screen.getByLabelText(/google map link/i);
              fireEvent.change(urlInput, { target: { value: invalidData.googleMapLink } });
            }

            if (invalidData.beforeYouGo !== undefined) {
              const beforeYouGoInput = screen.getByLabelText(/before you go/i);
              fireEvent.change(beforeYouGoInput, { target: { value: invalidData.beforeYouGo } });
            }

            if (invalidData.overview !== undefined) {
              const overviewInput = screen.getByLabelText(/overview/i);
              fireEvent.change(overviewInput, { target: { value: invalidData.overview } });
            }

            // Submit form
            const submitButton = screen.getByRole('button', { name: /create city/i });
            fireEvent.click(submitButton);

            // Wait for validation to complete
            await waitFor(() => {
              // At least one validation error should be present
              const errorElements = screen.queryAllByRole('alert');
              expect(errorElements.length).toBeGreaterThan(0);
            }, { timeout: 1000 });

            // Verify createCity was NOT called due to validation errors
            expect(mockCreateCity).not.toHaveBeenCalled();
          } finally {
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Valid coordinate ranges are accepted
   * Validates: Requirements 8.10
   */
  test('Property: Valid coordinate ranges are accepted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          longitude: fc.double({ min: -180, max: 180, noNaN: true })
        }),
        async (coords) => {
          mockCreateCity.mockResolvedValueOnce(undefined);
          const { unmount } = render(<CityForm />);

          try {
            // Enable manual coordinates
            const toggleButton = screen.getByRole('button', { name: /enter manually/i });
            fireEvent.click(toggleButton);

            // Enter valid coordinates
            const latInput = screen.getByLabelText(/^latitude/i);
            const lonInput = screen.getByLabelText(/^longitude/i);
            
            fireEvent.change(latInput, { target: { value: coords.latitude.toString() } });
            fireEvent.change(lonInput, { target: { value: coords.longitude.toString() } });

            // Fill other required fields
            fireEvent.change(screen.getByLabelText(/city name/i), { target: { value: 'Test City' } });
            fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'Test Country' } });
            fireEvent.change(screen.getByLabelText(/google map link/i), { target: { value: 'https://maps.google.com/test' } });
            fireEvent.change(screen.getByLabelText(/before you go/i), { target: { value: 'Test travel tips here' } });
            fireEvent.change(screen.getByLabelText(/overview/i), { target: { value: 'Test overview' } });

            // Add date
            const dateInput = screen.getByLabelText(/dates visited/i);
            fireEvent.change(dateInput, { target: { value: 'January 2024' } });
            fireEvent.click(screen.getByRole('button', { name: /add date/i }));

            // Submit form
            fireEvent.click(screen.getByRole('button', { name: /create city/i }));

            // Should not show coordinate validation errors
            await waitFor(() => {
              expect(screen.queryByText(/latitude must be between/i)).not.toBeInTheDocument();
              expect(screen.queryByText(/longitude must be between/i)).not.toBeInTheDocument();
            }, { timeout: 500 });
          } finally {
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Invalid coordinate ranges show validation errors
   * Validates: Requirements 8.10
   */
  test('Property: Invalid coordinate ranges show validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.record({
            latitude: fc.oneof(
              fc.double({ min: 90.01, max: 180, noNaN: true }),
              fc.double({ min: -180, max: -90.01, noNaN: true })
            ),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }),
          fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.oneof(
              fc.double({ min: 180.01, max: 360, noNaN: true }),
              fc.double({ min: -360, max: -180.01, noNaN: true })
            )
          })
        ),
        async (coords) => {
          const { unmount } = render(<CityForm />);

          try {
            // Enable manual coordinates
            const toggleButton = screen.getByRole('button', { name: /enter manually/i });
            fireEvent.click(toggleButton);

            // Enter invalid coordinates
            const latInput = screen.getByLabelText(/^latitude/i);
            const lonInput = screen.getByLabelText(/^longitude/i);
            
            fireEvent.change(latInput, { target: { value: coords.latitude.toString() } });
            fireEvent.change(lonInput, { target: { value: coords.longitude.toString() } });

            // Submit form
            fireEvent.click(screen.getByRole('button', { name: /create city/i }));

            // Should show coordinate validation errors
            await waitFor(() => {
              const hasLatError = screen.queryByText(/latitude must be between/i);
              const hasLonError = screen.queryByText(/longitude must be between/i);
              expect(hasLatError || hasLonError).toBeTruthy();
            }, { timeout: 1000 });

            // Verify createCity was NOT called
            expect(mockCreateCity).not.toHaveBeenCalled();
          } finally {
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
