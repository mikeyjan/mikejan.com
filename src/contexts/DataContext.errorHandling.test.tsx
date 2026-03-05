/**
 * Simple unit tests for error handling and state preservation
 * Property 20: Save failures preserve state and notify admin
 * **Validates: Requirements 10.5**
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import {
  PersonalInfo,
  City,
  UpdatePersonalInfoRequest,
  CreateCityRequest
} from '../types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock AuthContext
jest.mock('./AuthContext', () => {
  const actual = jest.requireActual('./AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      isAuthenticated: true,
      token: 'test-token',
      login: jest.fn(),
      logout: jest.fn(),
      error: null
    })
  };
});

// Helper to create wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <DataProvider>
      {children}
    </DataProvider>
  );
};

const mockPersonalInfo: PersonalInfo = {
  id: 'personal-info',
  name: 'John Doe',
  tagline: 'Developer',
  description: 'Software engineer',
  linkedInUrl: 'https://linkedin.com/in/johndoe',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockCity: City = {
  id: 'city-1',
  name: 'Tokyo',
  country: 'Japan',
  latitude: 35.6762,
  longitude: 139.6503,
  googleMapLink: 'https://maps.google.com/tokyo',
  datesVisited: ['2023-05-01'],
  beforeYouGo: 'Learn basic Japanese',
  overview: 'Amazing city',
  places: {
    bars: 'Golden Gai',
    restaurants: 'Sukiyabashi Jiro',
    pointsOfInterest: 'Senso-ji',
    gyms: 'Gold\'s Gym',
    accommodations: 'Park Hyatt'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('DataContext Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 20: Save failures preserve state and notify admin', () => {
    it('should preserve personal info when update fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPersonalInfo })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: { message: 'Update failed' } })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalName = result.current.personalInfo?.name;
      expect(originalName).toBe('John Doe');

      const updates: UpdatePersonalInfoRequest = {
        name: 'Jane Doe',
        tagline: 'Designer',
        description: 'UX Designer',
        linkedInUrl: 'https://linkedin.com/in/janedoe'
      };

      await act(async () => {
        try {
          await result.current.updatePersonalInfo(updates);
        } catch (err) {
          // Expected to throw
        }
      });

      // Wait for state to settle
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // State should be preserved
      expect(result.current.personalInfo?.name).toBe(originalName);
      
      // Error should be set in context
      expect(result.current.error).toBeTruthy();
    });

    it('should preserve cities when create fails', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPersonalInfo })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockCity] })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: { message: 'Create failed' } })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalCount = result.current.cities.length;
      expect(originalCount).toBe(1);

      const newCity: CreateCityRequest = {
        name: 'Osaka',
        country: 'Japan',
        latitude: 34.6937,
        longitude: 135.5023,
        googleMapLink: 'https://maps.google.com/osaka',
        datesVisited: ['2023-06-01'],
        beforeYouGo: 'Try takoyaki',
        overview: 'Food paradise',
        places: mockCity.places
      };

      await act(async () => {
        try {
          await result.current.createCity(newCity);
        } catch (err) {
          // Expected to throw
        }
      });

      // Wait for state to settle
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // State should be preserved
      expect(result.current.cities.length).toBe(originalCount);
      
      // Error should be set
      expect(result.current.error).toBeTruthy();
    });
  });
});
