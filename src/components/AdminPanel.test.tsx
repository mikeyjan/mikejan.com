/**
 * Unit tests for AdminPanel component
 * Requirements: 7.1-9.7
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminPanel } from './AdminPanel';
import { City } from '../types';

// Mock cities data
const mockCities: City[] = [
  {
    id: 'city-1',
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    googleMapLink: 'https://maps.google.com/tokyo',
    datesVisited: ['March 2024'],
    beforeYouGo: 'Learn basic Japanese',
    overview: 'A vibrant metropolis',
    places: {
      bars: [{ title: 'Golden Gai' }],
      restaurants: [{ title: 'Sukiyabashi Jiro' }],
      pointsOfInterest: [{ title: 'Tokyo Tower' }],
      gyms: [{ title: 'Anytime Fitness' }],
      accommodations: [{ title: 'Park Hyatt' }]
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'city-2',
    name: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    googleMapLink: 'https://maps.google.com/paris',
    datesVisited: ['June 2023'],
    beforeYouGo: 'Learn some French',
    overview: 'The City of Light',
    places: {
      bars: [{ title: 'Le Bar' }],
      restaurants: [{ title: 'Le Jules Verne' }],
      pointsOfInterest: [{ title: 'Eiffel Tower' }],
      gyms: [{ title: 'Fitness Park' }],
      accommodations: [{ title: 'Hotel Plaza' }]
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock contexts
const mockLogout = jest.fn();
const mockDeleteCity = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    token: 'mock-token',
    login: jest.fn(),
    logout: mockLogout
  })
}));

jest.mock('../contexts/DataContext', () => ({
  useData: () => ({
    personalInfo: null,
    cities: mockCities,
    loading: false,
    error: null,
    refreshData: jest.fn(),
    getCityDetails: jest.fn(),
    updatePersonalInfo: jest.fn(),
    createCity: jest.fn(),
    updateCity: jest.fn(),
    deleteCity: mockDeleteCity
  })
}));

describe('AdminPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Renders admin panel with header
   * Requirements: 7.1
   */
  it('should render admin panel with header', () => {
    render(<AdminPanel />);

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  /**
   * Test: Renders dashboard view by default
   * Requirements: 7.1, 8.1
   */
  it('should render dashboard view by default', () => {
    render(<AdminPanel />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Cities')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new city/i })).toBeInTheDocument();
  });

  /**
   * Test: Displays all cities in the list
   * Requirements: 8.1
   */
  it('should display all cities in the list', () => {
    render(<AdminPanel />);

    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  /**
   * Test: Logout button calls logout function
   * Requirements: 6.5
   */
  it('should call logout when logout button is clicked', () => {
    render(<AdminPanel />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Add New City button navigates to create city form
   * Requirements: 8.2
   */
  it('should navigate to create city form when Add New City is clicked', () => {
    render(<AdminPanel />);

    const addButton = screen.getByRole('button', { name: /add new city/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Add New City')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  /**
   * Test: Back button returns to dashboard from create city view
   * Requirements: 8.2
   */
  it('should return to dashboard when back button is clicked', () => {
    render(<AdminPanel />);

    // Navigate to create city
    const addButton = screen.getByRole('button', { name: /add new city/i });
    fireEvent.click(addButton);

    // Click back button
    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backButton);

    // Should be back on dashboard
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new city/i })).toBeInTheDocument();
  });

  /**
   * Test: Edit button navigates to edit city form
   * Requirements: 8.4
   */
  it('should navigate to edit city form when edit button is clicked', () => {
    render(<AdminPanel />);

    // Find and click edit button for first city
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit City')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tokyo')).toBeInTheDocument();
  });

  /**
   * Test: Delete button shows confirmation dialog
   * Requirements: 8.6
   */
  it('should show delete confirmation dialog when delete button is clicked', () => {
    render(<AdminPanel />);

    // Find and click delete button for first city
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });

  /**
   * Test: Cancel delete closes confirmation dialog
   * Requirements: 8.6
   */
  it('should close confirmation dialog when cancel is clicked', () => {
    render(<AdminPanel />);

    // Open delete confirmation
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Dialog should be closed
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  /**
   * Test: Confirm delete calls deleteCity function
   * Requirements: 8.7
   */
  it('should call deleteCity when delete is confirmed', async () => {
    mockDeleteCity.mockResolvedValueOnce(undefined);

    render(<AdminPanel />);

    // Open delete confirmation
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Click confirm
    const confirmButtons = screen.getAllByRole('button', { name: /delete/i });
    const confirmButton = confirmButtons.find(btn => 
      btn.className.includes('delete-confirmation-button-confirm')
    );
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    await waitFor(() => {
      expect(mockDeleteCity).toHaveBeenCalledWith('city-1');
    });
  });

  /**
   * Test: City form cancel returns to dashboard
   * Requirements: 8.2
   */
  it('should return to dashboard when city form cancel is clicked', () => {
    render(<AdminPanel />);

    // Navigate to create city
    const addButton = screen.getByRole('button', { name: /add new city/i });
    fireEvent.click(addButton);

    // Click cancel on form
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Should be back on dashboard
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });
});


/**
 * Property-based tests for AdminPanel
 */
import * as fc from 'fast-check';

describe('AdminPanel Property Tests', () => {
  /**
   * Property 13: Admin panel displays all cities
   * Validates: Requirements 8.1
   * 
   * This property verifies that the admin panel correctly displays all cities
   * from the data context, ensuring no cities are missing from the list.
   */
  it('Property 13: Admin panel displays all cities from mock data', () => {
    render(<AdminPanel />);

    // Property: All mock cities should be displayed (Requirement 8.1)
    mockCities.forEach(city => {
      expect(screen.getByText(city.name)).toBeInTheDocument();
      expect(screen.getByText(city.country)).toBeInTheDocument();
    });

    // Should have edit and delete buttons for each city
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    
    // Filter to get only city-specific buttons (exclude "Add City" buttons)
    const cityEditButtons = editButtons.filter(btn => 
      btn.getAttribute('aria-label')?.includes('Edit')
    );
    const cityDeleteButtons = deleteButtons.filter(btn => 
      btn.getAttribute('aria-label')?.includes('Delete')
    );

    expect(cityEditButtons.length).toBe(mockCities.length);
    expect(cityDeleteButtons.length).toBe(mockCities.length);
  });

  /**
   * Property 14: City edit form populates with current data
   * Validates: Requirements 8.4
   * 
   * This property verifies that when editing a city, the form is pre-populated
   * with all the current city data, allowing the admin to see and modify existing values.
   */
  it('Property 14: City edit form populates with current data', async () => {
    render(<AdminPanel />);

    // Test with first mock city
    const city = mockCities[0];

    // Click edit button for the city
    const editButton = screen.getByRole('button', { name: new RegExp(`Edit ${city.name}`, 'i') });
    fireEvent.click(editButton);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByText('Edit City')).toBeInTheDocument();
    });

    // Property: Form should be populated with current city data (Requirement 8.4)
    expect(screen.getByDisplayValue(city.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(city.country)).toBeInTheDocument();
    expect(screen.getByDisplayValue(city.latitude.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(city.longitude.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(city.googleMapLink)).toBeInTheDocument();
    expect(screen.getByDisplayValue(city.beforeYouGo)).toBeInTheDocument();
    expect(screen.getByDisplayValue(city.overview)).toBeInTheDocument();

    // Check dates are displayed
    city.datesVisited.forEach(date => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });
  });

  /**
   * Property 15: City creation persists and displays
   * Validates: Requirements 8.3
   * 
   * This property verifies that when creating a new city through the form,
   * the data is correctly passed to the createCity function for persistence.
   */
  it('Property 15: City creation calls createCity with form data', async () => {
    const mockCreateCity = jest.fn().mockResolvedValue(undefined);
    
    // Create a new mock for DataContext with createCity
    const originalMock = jest.requireMock('../contexts/DataContext');
    originalMock.useData = jest.fn(() => ({
      personalInfo: null,
      cities: mockCities,
      loading: false,
      error: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: mockCreateCity,
      updateCity: jest.fn(),
      deleteCity: mockDeleteCity
    }));

    render(<AdminPanel />);

    // Click "Add New City" button
    const addButton = screen.getByRole('button', { name: /add new city/i });
    fireEvent.click(addButton);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByText('Add New City')).toBeInTheDocument();
    });

    // Fill in the form with test data
    const testCityData = {
      name: 'Test City',
      country: 'Test Country',
      googleMapLink: 'https://maps.google.com/test',
      datesVisited: ['January 2024'],
      beforeYouGo: 'Test travel tips here',
      overview: 'Test city overview'
    };

    fireEvent.change(screen.getByLabelText(/city name/i), { target: { value: testCityData.name } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: testCityData.country } });
    fireEvent.change(screen.getByLabelText(/google map link/i), { target: { value: testCityData.googleMapLink } });
    fireEvent.change(screen.getByLabelText(/before you go/i), { target: { value: testCityData.beforeYouGo } });
    fireEvent.change(screen.getByLabelText(/overview/i), { target: { value: testCityData.overview } });

    // Add date
    const dateInput = screen.getByLabelText(/dates visited/i);
    fireEvent.change(dateInput, { target: { value: testCityData.datesVisited[0] } });
    fireEvent.click(screen.getByRole('button', { name: /add date/i }));

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create city/i });
    fireEvent.click(submitButton);

    // Property: createCity should be called with the form data (Requirement 8.3)
    await waitFor(() => {
      expect(mockCreateCity).toHaveBeenCalledWith(
        expect.objectContaining({
          name: testCityData.name,
          country: testCityData.country,
          googleMapLink: testCityData.googleMapLink,
          datesVisited: testCityData.datesVisited,
          beforeYouGo: testCityData.beforeYouGo,
          overview: testCityData.overview
        })
      );
    });
  });
});
