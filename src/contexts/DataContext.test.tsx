/**
 * Unit tests for DataContext
 * Requirements: All data operations
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import { AuthProvider } from './AuthContext';
import {
  PersonalInfo,
  City,
  UpdatePersonalInfoRequest,
  CreateCityRequest,
  UpdateCityRequest
} from '../types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock AuthContext
jest.mock('./AuthContext', () => {
  const actual = jest.requireActual('./AuthContext');
  let mockToken: string | null = null;
  
  return {
    ...actual,
    useAuth: () => ({
      isAuthenticated: mockToken !== null,
      token: mockToken,
      login: jest.fn(),
      logout: jest.fn(),
      error: null
    }),
    setMockToken: (token: string | null) => {
      mockToken = token;
    }
  };
});

// Helper to set mock token
const setMockToken = (token: string | null) => {
  const authModule = require('./AuthContext');
  authModule.setMockToken(token);
};

// Helper to create wrapper with Data provider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <DataProvider>
      {children}
    </DataProvider>
  );
};

// Mock data
const mockPersonalInfo: PersonalInfo = {
  id: 'personal-info',
  name: 'Michael Jan',
  tagline: 'Software Engineer',
  description: 'Passionate about building great software',
  linkedInUrl: 'https://linkedin.com/in/michaeljan',
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
  beforeYouGo: 'Learn basic Japanese phrases',
  overview: 'Amazing city with great food',
  places: {
    bars: [{ title: 'Golden Gai' }],
    restaurants: [{ title: 'Sukiyabashi Jiro' }],
    pointsOfInterest: [{ title: 'Senso-ji Temple' }],
    gyms: [{ title: 'Gold\'s Gym' }],
    accommodations: [{ title: 'Park Hyatt' }]
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('DataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('useData hook', () => {
    it('should throw error when used outside DataProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        renderHook(() => useData());
      }).toThrow('useData must be used within a DataProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Initial data loading', () => {
    it('should fetch personal info and cities on mount', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPersonalInfo })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockCity] })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      // Initially loading
      expect(result.current.loading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.personalInfo).toEqual(mockPersonalInfo);
      expect(result.current.cities).toEqual([mockCity]);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      // Wait for error to be set (which happens after retries complete)
      // Retries take: 1s + 2s + 4s = 7s total
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      }, { timeout: 15000 });

      expect(result.current.loading).toBe(false);
      expect(result.current.personalInfo).toBeNull();
      expect(result.current.cities).toEqual([]);
    }, 20000); // Set Jest timeout to 20 seconds for this test
  });

  describe('refreshData', () => {
    it('should refresh both personal info and cities', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPersonalInfo })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockCity] })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify initial data
      expect(result.current.personalInfo?.name).toBe('Michael Jan');
      expect(result.current.cities).toHaveLength(1);

      // Mock new data for refresh
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { ...mockPersonalInfo, name: 'Updated Name' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockCity, { ...mockCity, id: 'city-2' }] })
        });

      // Refresh data
      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.personalInfo?.name).toBe('Updated Name');
      expect(result.current.cities).toHaveLength(2);
    });
  });

  describe('getCityDetails', () => {
    it('should fetch and cache city details', async () => {
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
          ok: true,
          json: async () => ({ data: mockCity })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Fetch city details
      let cityDetails: City | undefined;
      await act(async () => {
        cityDetails = await result.current.getCityDetails('city-1');
      });

      expect(cityDetails).toEqual(mockCity);
      expect(global.fetch).toHaveBeenCalledWith('/api/cities/city-1');

      // Fetch again - should use cache
      await act(async () => {
        cityDetails = await result.current.getCityDetails('city-1');
      });

      // Should not make another fetch call
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial 2 + 1 for city details
    });

    it('should handle 404 errors for missing cities', async () => {
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
          status: 404,
          json: async () => ({ error: { message: 'City not found' } })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.getCityDetails('nonexistent');
        });
      }).rejects.toThrow('City not found');
    });
  });

  describe('updatePersonalInfo', () => {
    it('should update personal info and reflect changes immediately', async () => {
      setMockToken('mock-token');
      
      const updatedInfo = { ...mockPersonalInfo, name: 'Updated Name' };
      
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
          ok: true,
          json: async () => ({ data: updatedInfo })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates: UpdatePersonalInfoRequest = {
        name: 'Updated Name',
        tagline: mockPersonalInfo.tagline,
        description: mockPersonalInfo.description,
        linkedInUrl: mockPersonalInfo.linkedInUrl
      };

      await act(async () => {
        await result.current.updatePersonalInfo(updates);
      });

      expect(result.current.personalInfo?.name).toBe('Updated Name');
      
      setMockToken(null);
    });

    it('should throw error when not authenticated', async () => {
      setMockToken(null);
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPersonalInfo })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates: UpdatePersonalInfoRequest = {
        name: 'Updated Name',
        tagline: mockPersonalInfo.tagline,
        description: mockPersonalInfo.description,
        linkedInUrl: mockPersonalInfo.linkedInUrl
      };

      await expect(async () => {
        await act(async () => {
          await result.current.updatePersonalInfo(updates);
        });
      }).rejects.toThrow('Authentication required');
    });
  });

  describe('createCity', () => {
    it('should create city and add to local state', async () => {
      setMockToken('mock-token');
      
      const newCity = { ...mockCity, id: 'city-2', name: 'Osaka' };
      
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
          ok: true,
          json: async () => ({ data: newCity })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const cityData: CreateCityRequest = {
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
        await result.current.createCity(cityData);
      });

      expect(result.current.cities).toHaveLength(2);
      expect(result.current.cities[1].name).toBe('Osaka');
      
      setMockToken(null);
    });
  });

  describe('updateCity', () => {
    it('should update city and reflect changes in local state', async () => {
      setMockToken('mock-token');
      
      const updatedCity = { ...mockCity, name: 'Tokyo Updated' };
      
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
          ok: true,
          json: async () => ({ data: updatedCity })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const cityData: UpdateCityRequest = {
        name: 'Tokyo Updated',
        country: mockCity.country,
        latitude: mockCity.latitude,
        longitude: mockCity.longitude,
        googleMapLink: mockCity.googleMapLink,
        datesVisited: mockCity.datesVisited,
        beforeYouGo: mockCity.beforeYouGo,
        overview: mockCity.overview,
        places: mockCity.places
      };

      await act(async () => {
        await result.current.updateCity('city-1', cityData);
      });

      expect(result.current.cities[0].name).toBe('Tokyo Updated');
      
      setMockToken(null);
    });
  });

  describe('deleteCity', () => {
    it('should delete city and remove from local state', async () => {
      setMockToken('mock-token');
      
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
          ok: true,
          json: async () => ({ success: true })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.cities).toHaveLength(1);

      await act(async () => {
        await result.current.deleteCity('city-1');
      });

      expect(result.current.cities).toHaveLength(0);
      
      setMockToken(null);
    });
  });

  describe('Error handling', () => {
    it('should throw error on API failures', async () => {
      setMockToken('mock-token');
      
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
          json: async () => ({ error: { message: 'Validation failed' } })
        });

      const { result } = renderHook(() => useData(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates: UpdatePersonalInfoRequest = {
        name: '',
        tagline: '',
        description: '',
        linkedInUrl: ''
      };

      // Call the function and expect it to throw
      await expect(
        act(async () => {
          await result.current.updatePersonalInfo(updates);
        })
      ).rejects.toThrow('Validation failed');

      // Loading should be complete
      expect(result.current.loading).toBe(false);
      
      setMockToken(null);
    });
  });
});
