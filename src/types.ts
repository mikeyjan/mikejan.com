/**
 * Data model interfaces for the personal website
 */

/**
 * Personal information displayed in the Personal Section
 * Requirements: 1.1-1.4
 */
export interface PersonalInfo {
  id: string;              // Fixed ID (e.g., "personal-info")
  name: string;            // Display name
  tagline: string;         // Short tagline
  description: string;     // Longer description
  linkedInUrl: string;     // LinkedIn profile URL
  updatedAt: string;       // ISO 8601 timestamp
}

/**
 * Individual place within a city category
 * Requirements: 5.9
 */
export interface Place {
  title: string;
  link?: string;
  notes?: string;
}

/**
 * Categorized places for a city
 * Requirements: 5.9
 */
export interface PlacesCategories {
  bars: Place[];
  restaurants: Place[];
  pointsOfInterest: Place[];
  gyms: Place[];
  accommodations: Place[];
}

/**
 * Complete city information including all details
 * Requirements: 2.1, 5.4-5.9
 */
export interface City {
  id: string;                    // UUID
  name: string;                  // City name
  country: string;               // Country name
  latitude: number;              // Geographic latitude
  longitude: number;             // Geographic longitude
  googleMapLink: string;         // Custom Google Map URL
  datesVisited: string[];        // Array of date strings
  beforeYouGo: string;           // Travel tips section
  overview: string;              // City overview section
  places: PlacesCategories;      // Categorized places
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

/**
 * Simplified city information for list views
 * Used in tile view and map view before full details are needed
 */
export interface CityListItem {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * API Request and Response Interfaces
 */

// ============================================================================
// Public API Endpoints
// ============================================================================

/**
 * Response for GET /api/personal
 * Requirements: 1.1-1.4, 10.3
 */
export interface GetPersonalInfoResponse {
  data: PersonalInfo;
}

/**
 * Response for GET /api/cities
 * Requirements: 2.1, 10.3
 */
export interface GetCitiesResponse {
  data: City[];
}

/**
 * Response for GET /api/cities/:id
 * Requirements: 5.1-5.10
 */
export interface GetCityDetailsResponse {
  data: City;
}

// ============================================================================
// Admin Authentication
// ============================================================================

/**
 * Request for POST /api/admin/auth
 * Requirements: 6.1-6.3
 */
export interface AdminAuthRequest {
  password: string;
}

/**
 * Response for POST /api/admin/auth
 * Requirements: 6.1-6.3
 */
export interface AdminAuthResponse {
  token: string;
  expiresAt: string;  // ISO 8601 timestamp
}

// ============================================================================
// Admin Personal Info Management
// ============================================================================

/**
 * Request for PUT /api/admin/personal
 * Requirements: 7.1-7.5
 */
export interface UpdatePersonalInfoRequest {
  name: string;
  tagline: string;
  description: string;
  linkedInUrl: string;
}

/**
 * Response for PUT /api/admin/personal
 * Requirements: 7.3, 7.4, 10.1
 */
export interface UpdatePersonalInfoResponse {
  data: PersonalInfo;
}

// ============================================================================
// Admin City Management
// ============================================================================

/**
 * Request for POST /api/admin/cities
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

/**
 * Response for POST /api/admin/cities
 * Requirements: 8.3
 */
export interface CreateCityResponse {
  data: City;
}

/**
 * Request for PUT /api/admin/cities/:id
 * Requirements: 8.5, 8.6, 9.1-9.7
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

/**
 * Response for PUT /api/admin/cities/:id
 * Requirements: 8.5, 9.6, 9.7, 10.2
 */
export interface UpdateCityResponse {
  data: City;
}

/**
 * Response for DELETE /api/admin/cities/:id
 * Requirements: 8.7, 8.8
 */
export interface DeleteCityResponse {
  success: boolean;
}

// ============================================================================
// Error Response
// ============================================================================

/**
 * Standard error response for all API endpoints
 * Requirements: 10.5
 */
export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
