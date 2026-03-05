/**
 * DataContext for managing application data
 * Requirements: All data operations
 * 
 * This context provides data management functionality including:
 * - Fetching personal information and cities
 * - Caching city details for lazy loading
 * - CRUD operations for admin (create, update, delete cities and personal info)
 * - Loading and error state management
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import {
  PersonalInfo,
  City,
  GetPersonalInfoResponse,
  GetCitiesResponse,
  GetCityDetailsResponse,
  UpdatePersonalInfoRequest,
  UpdatePersonalInfoResponse,
  CreateCityRequest,
  CreateCityResponse,
  UpdateCityRequest,
  UpdateCityResponse,
  DeleteCityResponse,
  ApiErrorResponse
} from '../types';
import { useAuth } from './AuthContext';

/**
 * Retry configuration for transient failures
 * Requirements: 10.5
 */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Check if an error is a transient network error that should be retried
 * Requirements: 10.5
 */
function isTransientError(error: Error): boolean {
  const transientMessages = [
    'network error',
    'timeout',
    'connection refused',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'fetch failed'
  ];
  
  const errorMessage = error.message.toLowerCase();
  return transientMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for API calls with exponential backoff
 * Requirements: 10.5 - Implement retry logic for transient failures
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry if it's not a transient error or if we've exhausted retries
      if (!isTransientError(lastError) || attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: wait longer between each retry
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Get user-friendly error message from error object
 * Requirements: 10.5 - Display user-friendly error messages
 */
function getUserFriendlyErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('network error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    // Timeout errors
    if (error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }
    
    // Return the error message if it's already user-friendly
    return error.message;
  }
  
  return defaultMessage;
}

/**
 * Data context value interface
 * Requirements: All data operations
 */
interface DataContextValue {
  personalInfo: PersonalInfo | null;
  cities: City[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getCityDetails: (cityId: string) => Promise<City>;
  updatePersonalInfo: (updates: UpdatePersonalInfoRequest) => Promise<void>;
  createCity: (cityData: CreateCityRequest) => Promise<void>;
  updateCity: (cityId: string, cityData: UpdateCityRequest) => Promise<void>;
  deleteCity: (cityId: string) => Promise<void>;
}

/**
 * Create the data context
 */
const DataContext = createContext<DataContextValue | undefined>(undefined);

/**
 * Props for DataProvider component
 */
interface DataProviderProps {
  children: ReactNode;
}

/**
 * DataProvider component that wraps the application and provides data state
 * Requirements: All data operations
 */
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { token } = useAuth();
  
  // State management
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const cityDetailsCacheRef = useRef<Map<string, City>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch personal information from API
   * Requirements: 1.1-1.4, 10.3, 10.5
   */
  const fetchPersonalInfo = useCallback(async (): Promise<void> => {
    try {
      await retryWithBackoff(async () => {
        const response = await fetch('/api/personal');
        
        if (!response.ok) {
          throw new Error('Failed to fetch personal information');
        }
        
        const data: GetPersonalInfoResponse = await response.json();
        setPersonalInfo(data.data);
      });
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err, 'Failed to fetch personal information');
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Fetch cities list from API
   * Requirements: 2.1, 10.3, 10.5
   */
  const fetchCities = useCallback(async (): Promise<void> => {
    try {
      await retryWithBackoff(async () => {
        const response = await fetch('/api/cities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        
        const data: GetCitiesResponse = await response.json();
        setCities(data.data);
      });
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err, 'Failed to fetch cities');
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Refresh all data from API
   * Requirements: 10.3, 10.4, 10.5
   */
  const refreshData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchPersonalInfo(),
        fetchCities()
      ]);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err, 'Failed to load data');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchPersonalInfo, fetchCities]);

  /**
   * Get city details with caching
   * Requirements: 5.1-5.10, 10.5
   * 
   * @param cityId - City ID to fetch details for
   * @returns Full city details
   */
  const getCityDetails = useCallback(async (cityId: string): Promise<City> => {
    const cached = cityDetailsCacheRef.current.get(cityId);
    if (cached) return cached;

    try {
      return await retryWithBackoff(async () => {
        const response = await fetch(`/api/cities/${cityId}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'City not found' : 'Failed to fetch city details');
        }
        const data: GetCityDetailsResponse = await response.json();
        cityDetailsCacheRef.current.set(cityId, data.data);
        return data.data;
      });
    } catch (err) {
      throw new Error(getUserFriendlyErrorMessage(err, 'Failed to fetch city details'));
    }
  }, []);

  /**
   * Update personal information (admin only)
   * Requirements: 7.1-7.5, 10.1, 10.5
   * 
   * @param updates - Personal information updates
   */
  const updatePersonalInfo = useCallback(async (updates: UpdatePersonalInfoRequest): Promise<void> => {
    if (!token) {
      throw new Error('Authentication required');
    }

    // Preserve current state in case of failure
    const previousState = personalInfo;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/personal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          error: { message: 'Failed to update personal information' }
        }));
        throw new Error(errorData.error.message);
      }

      const data: UpdatePersonalInfoResponse = await response.json();
      
      // Update local state immediately
      // Requirements: 7.4 - Immediately reflect updates
      setPersonalInfo(data.data);
    } catch (err) {
      // Preserve previous state on failure
      // Requirements: 10.5 - Save failures preserve state
      setPersonalInfo(previousState);
      
      const errorMessage = getUserFriendlyErrorMessage(err, 'Failed to update personal information');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, personalInfo]);

  /**
   * Create a new city (admin only)
   * Requirements: 8.2-8.4, 8.9, 8.10, 10.5
   * 
   * @param cityData - New city data
   */
  const createCity = useCallback(async (cityData: CreateCityRequest): Promise<void> => {
    if (!token) {
      throw new Error('Authentication required');
    }

    // Preserve current state in case of failure
    const previousCities = cities;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cityData)
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          error: { message: 'Failed to create city' }
        }));
        throw new Error(errorData.error.message);
      }

      const data: CreateCityResponse = await response.json();
      
      // Add new city to local state
      // Requirements: 8.3 - Persist and display in Cities Section
      setCities(prev => [...prev, data.data]);
      cityDetailsCacheRef.current.set(data.data.id, data.data);
    } catch (err) {
      // Preserve previous state on failure
      // Requirements: 10.5 - Save failures preserve state
      setCities(previousCities);
      
      const errorMessage = getUserFriendlyErrorMessage(err, 'Failed to create city');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, cities]);

  /**
   * Update an existing city (admin only)
   * Requirements: 8.5, 8.6, 9.6, 9.7, 10.5
   * 
   * @param cityId - City ID to update
   * @param cityData - Updated city data
   */
  const updateCity = useCallback(async (cityId: string, cityData: UpdateCityRequest): Promise<void> => {
    if (!token) throw new Error('Authentication required');

    const previousCities = cities;
    const previousCache = new Map(cityDetailsCacheRef.current);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cities/${cityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(cityData)
      });
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({ error: { message: 'Failed to update city' } }));
        throw new Error(errorData.error.message);
      }
      const data: UpdateCityResponse = await response.json();
      setCities(prev => prev.map(city => city.id === cityId ? data.data : city));
      cityDetailsCacheRef.current.set(cityId, data.data);
    } catch (err) {
      setCities(previousCities);
      cityDetailsCacheRef.current = previousCache;
      const errorMessage = getUserFriendlyErrorMessage(err, 'Failed to update city');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, cities]);

  /**
   * Delete a city (admin only)
   * Requirements: 8.7, 8.8, 10.5
   * 
   * @param cityId - City ID to delete
   */
  const deleteCity = useCallback(async (cityId: string): Promise<void> => {
    if (!token) throw new Error('Authentication required');

    const previousCities = cities;
    const previousCache = new Map(cityDetailsCacheRef.current);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cities/${cityId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({ error: { message: 'Failed to delete city' } }));
        throw new Error(errorData.error.message);
      }
      setCities(prev => prev.filter(city => city.id !== cityId));
      cityDetailsCacheRef.current.delete(cityId);
    } catch (err) {
      setCities(previousCities);
      cityDetailsCacheRef.current = previousCache;
      const errorMessage = getUserFriendlyErrorMessage(err, 'Failed to delete city');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, cities]);

  // Load initial data on mount
  // Requirements: 10.3, 10.4
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when refreshData changes

  // Provide data context to children
  const value: DataContextValue = {
    personalInfo,
    cities,
    loading,
    error,
    refreshData,
    getCityDetails,
    updatePersonalInfo,
    createCity,
    updateCity,
    deleteCity
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * Custom hook to access data context
 * 
 * @returns DataContextValue
 * @throws Error if used outside DataProvider
 */
export const useData = (): DataContextValue => {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
};
