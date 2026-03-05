/**
 * Unit tests for CityList component
 * Requirements: 8.1, 8.2
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CityList from './CityList';
import { useData } from '../contexts/DataContext';
import { City } from '../types';

// Mock the DataContext
jest.mock('../contexts/DataContext');

const mockUseData = useData as jest.MockedFunction<typeof useData>;

describe('CityList', () => {
  const mockOnAddCity = jest.fn();
  const mockOnEditCity = jest.fn();
  const mockOnDeleteCity = jest.fn();

  const mockCities: City[] = [
    {
      id: '1',
      name: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      googleMapLink: 'https://maps.google.com',
      datesVisited: ['2023-05-01', '2023-06-15'],
      beforeYouGo: 'Bring comfortable shoes',
      overview: 'City of lights',
      places: {
        bars: 'Bar 1',
        restaurants: 'Restaurant 1',
        pointsOfInterest: 'Eiffel Tower',
        gyms: 'Gym 1',
        accommodations: 'Hotel 1'
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Tokyo',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      googleMapLink: 'https://maps.google.com',
      datesVisited: ['2023-08-20'],
      beforeYouGo: 'Learn basic Japanese',
      overview: 'Modern metropolis',
      places: {
        bars: 'Bar 2',
        restaurants: 'Restaurant 2',
        pointsOfInterest: 'Shibuya Crossing',
        gyms: 'Gym 2',
        accommodations: 'Hotel 2'
      },
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Display all cities
   * Requirements: 8.1
   */
  it('should display all cities from DataContext', () => {
    mockUseData.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    // Check that both cities are displayed
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  /**
   * Test: Display dates visited
   * Requirements: 8.1
   */
  it('should display dates visited for each city', () => {
    mockUseData.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    expect(screen.getByText('2023-05-01, 2023-06-15')).toBeInTheDocument();
    expect(screen.getByText('2023-08-20')).toBeInTheDocument();
  });

  /**
   * Test: Display edit and delete buttons for each city
   * Requirements: 8.1
   */
  it('should display edit and delete buttons for each city', () => {
    mockUseData.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    // Should have 2 edit buttons (one for each city)
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons).toHaveLength(2);

    // Should have 2 delete buttons (one for each city)
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });

  /**
   * Test: Handle Add City button click
   * Requirements: 8.2
   */
  it('should call onAddCity when Add City button is clicked', () => {
    mockUseData.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    const addButton = screen.getByText('Add City');
    fireEvent.click(addButton);

    expect(mockOnAddCity).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Handle Edit button click
   * Requirements: 8.4
   */
  it('should call onEditCity with correct city when Edit button is clicked', () => {
    mockUseData.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]); // Click edit for first city (Paris)

    expect(mockOnEditCity).toHaveBeenCalledTimes(1);
    expect(mockOnEditCity).toHaveBeenCalledWith(mockCities[0]);
  });

  /**
   * Test: Handle Delete button click
   * Requirements: 8.6, 8.7
   */
  it('should call onDeleteCity with correct city when Delete button is clicked', () => {
    mockUseData.mockReturnValue({
      cities: mockCities,
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[1]); // Click delete for second city (Tokyo)

    expect(mockOnDeleteCity).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteCity).toHaveBeenCalledWith(mockCities[1]);
  });

  /**
   * Test: Show loading state
   * Requirements: 8.1
   */
  it('should show loading state when data is loading', () => {
    mockUseData.mockReturnValue({
      cities: [],
      loading: true,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    expect(screen.getByText('Loading cities...')).toBeInTheDocument();
  });

  /**
   * Test: Show empty state when no cities
   * Requirements: 8.1
   */
  it('should show empty state when there are no cities', () => {
    mockUseData.mockReturnValue({
      cities: [],
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    expect(screen.getByText(/No cities yet/)).toBeInTheDocument();
  });

  /**
   * Test: Disable buttons when loading
   * Requirements: 8.1
   */
  it('should disable buttons when loading', () => {
    mockUseData.mockReturnValue({
      cities: mockCities,
      loading: true,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    const addButton = screen.getByText('Add City');
    expect(addButton).toBeDisabled();
  });

  /**
   * Test: Handle cities with no dates visited
   * Requirements: 8.1
   */
  it('should handle cities with no dates visited', () => {
    const cityWithNoDates: City = {
      ...mockCities[0],
      datesVisited: []
    };

    mockUseData.mockReturnValue({
      cities: [cityWithNoDates],
      loading: false,
      error: null,
      personalInfo: null,
      refreshData: jest.fn(),
      getCityDetails: jest.fn(),
      updatePersonalInfo: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      deleteCity: jest.fn()
    });

    render(
      <CityList
        onAddCity={mockOnAddCity}
        onEditCity={mockOnEditCity}
        onDeleteCity={mockOnDeleteCity}
      />
    );

    expect(screen.getByText('No dates')).toBeInTheDocument();
  });
});
