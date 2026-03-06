/**
 * Property-based tests for DataContext error handling
 * Property 20: Save failures preserve state and notify admin
 * **Validates: Requirements 10.5**
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { DataProvider, useData } from './DataContext';
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
  let mockToken: string | null = 'test-token';
  
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

// Helper to create wrapper with Data provider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <DataProvider>
      {children}
    </DataProvider>
  );
};

// Arbitraries for generating test data
const personalInfoArbitrary = fc.record({
  id: fc.constantFrom('personal-info'),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  tagline: fc.string({ minLength: 1, maxLength: 80 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  linkedInUrl: fc.constantFrom('https://linkedin.com/in/user', 'https://linkedin.com/in/test'),
  updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 }).map(ms => new Date(ms).toISOString())
});

const cityArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  country: fc.string({ minLength: 1, maxLength: 50 }),
  latitude: fc.double({ min: -90, max: 90, noNaN: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true }),
  googleMapLink: fc.constantFrom('https://maps.google.com/?q=test', 'https://maps.google.com/?q=city'),
  datesVisited: fc.array(
    fc.integer({ min: 946684800000, max: 1893456000000 }).map(ms => new Date(ms).toISOString().split('T')[0]),
    { minLength: 1, maxLength: 3 }
  ),
  beforeYouGo: fc.string({ maxLength: 100 }),
  overview: fc.string({ maxLength: 100 }),
  places: fc.record({
    bars: fc.array(fc.record({ title: fc.string({ minLength: 1, maxLength: 30 }) }), { maxLength: 3 }),
    restaurants: fc.array(fc.record({ title: fc.string({ minLength: 1, maxLength: 30 }) }), { maxLength: 3 }),
    pointsOfInterest: fc.array(fc.record({ title: fc.string({ minLength: 1, maxLength: 30 }) }), { maxLength: 3 }),
    gyms: fc.array(fc.record({ title: fc.string({ minLength: 1, maxLength: 30 }) }), { maxLength: 3 }),
    accommodations: fc.array(fc.record({ title: fc.string({ minLength: 1, maxLength: 30 }) }), { maxLength: 3 })
  }),
  createdAt: fc.integer({ min: 946684800000, max: 1893456000000 }).map(ms => new Date(ms).toISOString()),
  updatedAt: fc.integer({ min: 946684800000, max: 1893456000000 }).map(ms => new Date(ms).toISOString())
});

const errorMessageArbitrary = fc.constantFrom(
  'Network error',
  'Server error',
  'Validation failed',
  'Unauthorized',
  'Internal server error'
);

describe('DataContext Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 20: Save failures preserve state and notify admin', () => {
    /**
     * Property: When a save operation fails, the previous state should be preserved
     * and an error message should be set to notify the admin
     */
    it('should preserve personal info state when update fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          personalInfoArbitrary,
          personalInfoArbitrary,
          errorMessageArbitrary,
          async (initialInfo, updateAttempt, apiErrorMessage) => {
            // Skip if update is identical to initial (nothing to test)
            const initialFields = { name: initialInfo.name, tagline: initialInfo.tagline, description: initialInfo.description, linkedInUrl: initialInfo.linkedInUrl };
            const updateFields = { name: updateAttempt.name, tagline: updateAttempt.tagline, description: updateAttempt.description, linkedInUrl: updateAttempt.linkedInUrl };
            if (JSON.stringify(initialFields) === JSON.stringify(updateFields)) {
              return;
            }

            // Setup: Mock initial successful load
            (global.fetch as jest.Mock)
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: initialInfo })
              })
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] })
              })
              // Mock failed update
              .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: { message: apiErrorMessage } })
              });

            const { result } = renderHook(() => useData(), {
              wrapper: createWrapper()
            });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            const initialName = result.current.personalInfo?.name;
            const initialTagline = result.current.personalInfo?.tagline;

            // Attempt update that will fail
            const updates: UpdatePersonalInfoRequest = {
              name: updateAttempt.name,
              tagline: updateAttempt.tagline,
              description: updateAttempt.description,
              linkedInUrl: updateAttempt.linkedInUrl
            };

            let errorThrown = false;
            try {
              await act(async () => {
                await result.current.updatePersonalInfo(updates);
              });
            } catch (err) {
              errorThrown = true;
            }

            // Wait for state to settle
            await act(async () => {
              await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Verify: Error was thrown
            expect(errorThrown).toBe(true);

            // Verify: State was preserved (not updated to failed values)
            expect(result.current.personalInfo?.name).toBe(initialName);
            expect(result.current.personalInfo?.tagline).toBe(initialTagline);

            // Verify: Error message was set to notify admin
            expect(result.current.error).toBeTruthy();
            expect(typeof result.current.error).toBe('string');
          }
        ),
        { numRuns: 20 }
      );
    }, 30000); // 30 second timeout for this test

    it('should preserve cities state when create fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cityArbitrary, { minLength: 0, maxLength: 5 }),
          cityArbitrary,
          errorMessageArbitrary,
          async (initialCities, newCity, apiErrorMessage) => {
            // Setup: Mock initial successful load
            (global.fetch as jest.Mock)
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { id: 'personal-info', name: 'Test', tagline: 'Test', description: 'Test', linkedInUrl: 'https://test.com', updatedAt: '2024-01-01T00:00:00Z' } })
              })
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: initialCities })
              })
              // Mock failed create
              .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: { message: apiErrorMessage } })
              });

            const { result } = renderHook(() => useData(), {
              wrapper: createWrapper()
            });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            const initialCount = result.current.cities.length;

            // Attempt create that will fail
            const cityData: CreateCityRequest = {
              name: newCity.name,
              country: newCity.country,
              latitude: newCity.latitude,
              longitude: newCity.longitude,
              googleMapLink: newCity.googleMapLink,
              datesVisited: newCity.datesVisited,
              beforeYouGo: newCity.beforeYouGo,
              overview: newCity.overview,
              places: newCity.places
            };

            let errorThrown = false;
            try {
              await act(async () => {
                await result.current.createCity(cityData);
              });
            } catch (err) {
              errorThrown = true;
            }

            // Wait for state to settle
            await act(async () => {
              await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Verify: Error was thrown
            expect(errorThrown).toBe(true);

            // Verify: State was preserved (no new city added)
            expect(result.current.cities.length).toBe(initialCount);

            // Verify: Error message was set to notify admin
            expect(result.current.error).toBeTruthy();
            expect(typeof result.current.error).toBe('string');
          }
        ),
        { numRuns: 20 }
      );
    }, 30000); // 30 second timeout for this test

    it('should preserve cities state when update fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cityArbitrary, { minLength: 1, maxLength: 5 }),
          cityArbitrary,
          errorMessageArbitrary,
          async (initialCities, updateData, apiErrorMessage) => {
            const cityToUpdate = initialCities[0];
            
            // Skip if update is identical to initial city (nothing to test)
            if (cityToUpdate.name === updateData.name && 
                cityToUpdate.country === updateData.country &&
                cityToUpdate.latitude === updateData.latitude &&
                cityToUpdate.longitude === updateData.longitude) {
              return;
            }

            // Setup: Mock initial successful load
            (global.fetch as jest.Mock)
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { id: 'personal-info', name: 'Test', tagline: 'Test', description: 'Test', linkedInUrl: 'https://test.com', updatedAt: '2024-01-01T00:00:00Z' } })
              })
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: initialCities })
              })
              // Mock failed update
              .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: { message: apiErrorMessage } })
              });

            const { result } = renderHook(() => useData(), {
              wrapper: createWrapper()
            });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            const initialName = result.current.cities.find(c => c.id === cityToUpdate.id)?.name;
            const initialCount = result.current.cities.length;

            // Attempt update that will fail
            const cityUpdates: UpdateCityRequest = {
              name: updateData.name,
              country: updateData.country,
              latitude: updateData.latitude,
              longitude: updateData.longitude,
              googleMapLink: updateData.googleMapLink,
              datesVisited: updateData.datesVisited,
              beforeYouGo: updateData.beforeYouGo,
              overview: updateData.overview,
              places: updateData.places
            };

            let errorThrown = false;
            try {
              await act(async () => {
                await result.current.updateCity(cityToUpdate.id, cityUpdates);
              });
            } catch (err) {
              errorThrown = true;
            }

            // Wait for state to settle
            await act(async () => {
              await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Verify: Error was thrown
            expect(errorThrown).toBe(true);

            // Verify: State was preserved (city not updated)
            expect(result.current.cities.length).toBe(initialCount);
            const unchangedCity = result.current.cities.find(c => c.id === cityToUpdate.id);
            expect(unchangedCity?.name).toBe(initialName);

            // Verify: Error message was set to notify admin
            expect(result.current.error).toBeTruthy();
            expect(typeof result.current.error).toBe('string');
          }
        ),
        { numRuns: 20 }
      );
    }, 30000); // 30 second timeout for this test

    it('should preserve cities state when delete fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cityArbitrary, { minLength: 1, maxLength: 5 }),
          errorMessageArbitrary,
          async (initialCities, apiErrorMessage) => {
            // Setup: Mock initial successful load
            (global.fetch as jest.Mock)
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { id: 'personal-info', name: 'Test', tagline: 'Test', description: 'Test', linkedInUrl: 'https://test.com', updatedAt: '2024-01-01T00:00:00Z' } })
              })
              .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: initialCities })
              })
              // Mock failed delete
              .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: { message: apiErrorMessage } })
              });

            const { result } = renderHook(() => useData(), {
              wrapper: createWrapper()
            });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            const cityToDelete = initialCities[0];
            const initialCount = result.current.cities.length;

            // Attempt delete that will fail
            let errorThrown = false;
            try {
              await act(async () => {
                await result.current.deleteCity(cityToDelete.id);
              });
            } catch (err) {
              errorThrown = true;
            }

            // Wait for state to settle
            await act(async () => {
              await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Verify: Error was thrown
            expect(errorThrown).toBe(true);

            // Verify: State was preserved (city not deleted)
            expect(result.current.cities.length).toBe(initialCount);
            const stillExists = result.current.cities.find(c => c.id === cityToDelete.id);
            expect(stillExists).toBeDefined();

            // Verify: Error message was set to notify admin
            expect(result.current.error).toBeTruthy();
            expect(typeof result.current.error).toBe('string');
          }
        ),
        { numRuns: 20 }
      );
    }, 30000); // 30 second timeout for this test
  });
});
