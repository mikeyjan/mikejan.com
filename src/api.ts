/**
 * API request and response interfaces for the personal website
 * These interfaces define the contract between the frontend and backend API
 */

import { PersonalInfo, City, PlacesCategories } from './types';

// ============================================================================
// Public API Endpoints
// ============================================================================

/**
 * GET /api/personal
 * Retrieves personal information for display in the Personal Section
 * Requirements: 1.1-1.4, 10.3
 */
export interface GetPersonalInfoResponse {
  data: PersonalInfo;
}

/**
 * GET /api/cities
 * Retrieves list of all cities for display in Cities Section
 * Requirements: 2.1, 10.3
 */
export interface GetCitiesResponse {
  data: City[];
}

/**
 * GET /api/cities/:id
 * Retrieves full details for a specific city (lazy loaded)
 * Requirements: 5.1-5.10
 */
export interface GetCityDetailsResponse {
  data: City;
}

// ============================================================================
// Admin Authentication Endpoints
// ============================================================================

/**
 * POST /api/admin/auth
 * Authenticates admin user with password
 * Requirements: 6.1-6.3
 */
export interface AdminAuthRequest {
  password: string;
}

export interface AdminAuthResponse {
  token: string;           // JWT token for authenticated requests
  expiresAt: string;       // ISO 8601 timestamp when token expires
}

// ============================================================================
// Admin Personal Info Management
// ============================================================================

/**
 * PUT /api/admin/personal
 * Updates personal information (admin only)
 * Requirements: 7.1-7.5, 10.1
 */
export interface UpdatePersonalInfoRequest {
  name: string;
  tagline: string;
  description: string;
  linkedInUrl: string;
}

export interface UpdatePersonalInfoResponse {
  data: PersonalInfo;
}

// ============================================================================
// Admin City Management
// ============================================================================

/**
 * POST /api/admin/cities
 * Creates a new city entry (admin only)
 * Requirements: 8.2-8.4, 8.9, 8.10, 9.1-9.7
 */
export interface CreateCityRequest {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  googleMapLink: string;
  datesVisited: string[];
  beforeYouGo: string;
  overview: string;
  places: PlacesCategories;
}

export interface CreateCityResponse {
  data: City;
}

/**
 * PUT /api/admin/cities/:id
 * Updates an existing city entry (admin only)
 * Requirements: 8.5, 8.6, 9.6, 9.7
 */
export interface UpdateCityRequest {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  googleMapLink: string;
  datesVisited: string[];
  beforeYouGo: string;
  overview: string;
  places: PlacesCategories;
}

export interface UpdateCityResponse {
  data: City;
}

/**
 * DELETE /api/admin/cities/:id
 * Deletes a city entry (admin only)
 * Requirements: 8.7, 8.8
 */
export interface DeleteCityResponse {
  success: boolean;
}

// ============================================================================
// Error Response
// ============================================================================

/**
 * Standard error response format for all API endpoints
 * Used when requests fail due to validation, authentication, or server errors
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;  // Field-specific validation errors
  };
}
