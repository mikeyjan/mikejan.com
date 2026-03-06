/**
 * API Configuration
 * Centralizes API endpoint configuration for the application
 */

import awsExports from '../aws-exports';

// Get the API endpoint from aws-exports
const apiConfig = awsExports.aws_cloud_logic_custom?.[0];
const API_BASE_URL = apiConfig?.endpoint || '';

/**
 * API endpoints configuration
 * Maps frontend paths to actual API Gateway paths
 */
export const API_ENDPOINTS = {
  // Public endpoints
  cities: `${API_BASE_URL}/cities`,
  cityDetails: (cityId: string) => `${API_BASE_URL}/city/${cityId}`,
  personal: `${API_BASE_URL}/personal`,
  
  // Auth endpoint
  auth: `${API_BASE_URL}/auth`,
  
  // Admin endpoints
  adminCities: `${API_BASE_URL}/admin/cities`,
  adminCity: (cityId: string) => `${API_BASE_URL}/admin/city/${cityId}`,
  adminPersonal: `${API_BASE_URL}/admin/personal`,
};

export default API_ENDPOINTS;
