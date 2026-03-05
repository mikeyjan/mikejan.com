/**
 * Unit tests for PersonalInfoForm component
 * Requirements: 7.1-7.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonalInfoForm from './PersonalInfoForm';
import { PersonalInfo, UpdatePersonalInfoRequest } from '../types';

/**
 * Mock personal info data
 */
const mockPersonalInfo: PersonalInfo = {
  id: 'personal-info',
  name: 'John Doe',
  tagline: 'Software Developer',
  description: 'Passionate about building great software',
  linkedInUrl: 'https://www.linkedin.com/in/johndoe',
  updatedAt: '2024-01-01T00:00:00Z'
};

/**
 * Mock DataContext
 */
const mockUpdatePersonalInfo = jest.fn();
const mockDataContext = {
  personalInfo: mockPersonalInfo,
  cities: [],
  loading: false,
  error: null,
  refreshData: jest.fn(),
  getCityDetails: jest.fn(),
  updatePersonalInfo: mockUpdatePersonalInfo,
  createCity: jest.fn(),
  updateCity: jest.fn(),
  deleteCity: jest.fn()
};

// Mock the DataContext module
jest.mock('../contexts/DataContext', () => ({
  useData: () => mockDataContext
}));

describe('PersonalInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataContext.loading = false;
    mockDataContext.error = null;
    mockDataContext.personalInfo = mockPersonalInfo;
    mockUpdatePersonalInfo.mockReset();
  });

  /**
   * Test: Component renders all editable fields
   * Requirements: 7.1
   */
  test('renders all editable fields for personal information', async () => {
    render(<PersonalInfoForm />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Check all fields are present
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tagline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/linkedin url/i)).toBeInTheDocument();
    
    // Check save button is present
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  /**
   * Test: Form fields are populated with current data
   * Requirements: 7.1
   */
  test('populates form fields with current personal information', async () => {
    render(<PersonalInfoForm />);

    // Wait for data to load and populate
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe(mockPersonalInfo.name);
    });

    const taglineInput = screen.getByLabelText(/tagline/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    const linkedInInput = screen.getByLabelText(/linkedin url/i) as HTMLInputElement;

    expect(taglineInput.value).toBe(mockPersonalInfo.tagline);
    expect(descriptionInput.value).toBe(mockPersonalInfo.description);
    expect(linkedInInput.value).toBe(mockPersonalInfo.linkedInUrl);
  });

  /**
   * Test: Validation errors are displayed for empty fields
   * Requirements: 7.2, 7.5
   */
  test('displays validation errors for empty required fields', async () => {
    render(<PersonalInfoForm />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Clear all fields
    const nameInput = screen.getByLabelText(/name/i);
    const taglineInput = screen.getByLabelText(/tagline/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const linkedInInput = screen.getByLabelText(/linkedin url/i);

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(taglineInput, { target: { value: '' } });
    fireEvent.change(descriptionInput, { target: { value: '' } });
    fireEvent.change(linkedInInput, { target: { value: '' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    // Check validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/tagline is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/linkedin url is required/i)).toBeInTheDocument();
  });

  /**
   * Test: Validation errors for invalid LinkedIn URL
   * Requirements: 7.2, 7.5
   */
  test('displays validation error for invalid LinkedIn URL', async () => {
    render(<PersonalInfoForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/linkedin url/i)).toBeInTheDocument();
    });

    const linkedInInput = screen.getByLabelText(/linkedin url/i);

    // Test invalid URL
    fireEvent.change(linkedInInput, { target: { value: 'not-a-url' } });
    
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
    });

    // Test non-LinkedIn URL
    fireEvent.change(linkedInInput, { target: { value: 'https://www.google.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be a valid linkedin url/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Validation errors for field length constraints
   * Requirements: 7.2, 7.5
   */
  test('displays validation errors for field length constraints', async () => {
    render(<PersonalInfoForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/name/i);
    const taglineInput = screen.getByLabelText(/tagline/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    // Test name too short
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });

    // Test tagline too short
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(taglineInput, { target: { value: 'Dev' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/tagline must be at least 5 characters/i)).toBeInTheDocument();
    });

    // Test description too short
    fireEvent.change(taglineInput, { target: { value: 'Developer' } });
    fireEvent.change(descriptionInput, { target: { value: 'Short' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Successful save operation
   * Requirements: 7.3, 7.4
   */
  test('successfully saves valid personal information', async () => {
    const updatedData: UpdatePersonalInfoRequest = {
      name: 'Jane Smith',
      tagline: 'Senior Software Engineer',
      description: 'Building amazing web applications with React and TypeScript',
      linkedInUrl: 'https://www.linkedin.com/in/janesmith'
    };

    // Mock successful update
    mockUpdatePersonalInfo.mockResolvedValueOnce(undefined);

    render(<PersonalInfoForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: updatedData.name } });
    fireEvent.change(screen.getByLabelText(/tagline/i), { target: { value: updatedData.tagline } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: updatedData.description } });
    fireEvent.change(screen.getByLabelText(/linkedin url/i), { target: { value: updatedData.linkedInUrl } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    // Check success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/changes saved successfully/i)).toBeInTheDocument();
    });

    // Verify updatePersonalInfo was called with correct data
    expect(mockUpdatePersonalInfo).toHaveBeenCalledWith(updatedData);
  });

  /**
   * Test: Error handling for failed save operation
   * Requirements: 7.5
   */
  test('displays error message when save operation fails', async () => {
    // Mock failed update
    mockUpdatePersonalInfo.mockRejectedValueOnce(new Error('Failed to update personal information'));

    render(<PersonalInfoForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Submit form with valid data
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to update personal information/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Loading state during save operation
   * Requirements: 7.3
   */
  test('shows loading state during save operation', async () => {
    // Mock a delayed update
    mockUpdatePersonalInfo.mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 50));
    });

    render(<PersonalInfoForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    // The component should show "Saving..." immediately after click
    // Note: The component manages its own internal loading state
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/saving/i);
    }, { timeout: 100 });

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText(/changes saved successfully/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Validation error clears when user starts typing
   * Requirements: 7.2, 7.5
   */
  test('clears validation error when user modifies field', async () => {
    render(<PersonalInfoForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Clear name field and submit to trigger validation error
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    // Start typing in name field
    fireEvent.change(nameInput, { target: { value: 'J' } });

    // Validation error should be cleared
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });
});
