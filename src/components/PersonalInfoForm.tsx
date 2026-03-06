/**
 * PersonalInfoForm component for editing personal information
 * Requirements: 7.1-7.5
 * 
 * This component provides editable fields for personal information:
 * - Renders editable fields for name, tagline, description, LinkedIn URL
 * - Implements client-side validation
 * - Uses updatePersonalInfo from DataContext to save changes
 * - Displays validation errors
 * - Shows loading state during save
 * - Displays success/error messages
 */

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { UpdatePersonalInfoRequest } from '../types';
import './PersonalInfoForm.css';

/**
 * Validation errors interface
 */
interface ValidationErrors {
  name?: string;
  tagline?: string;
  description?: string;
  linkedInUrl?: string;
}

/**
 * PersonalInfoForm component
 * Requirements: 7.1-7.5
 */
const PersonalInfoForm: React.FC = () => {
  const { personalInfo, updatePersonalInfo } = useData();
  
  // Form state
  const [formData, setFormData] = useState<UpdatePersonalInfoRequest>({
    name: '',
    tagline: '',
    description: '',
    linkedInUrl: ''
  });
  
  // Validation and feedback state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form ref for programmatic submission
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Keyboard shortcut handler (Cmd+S / Ctrl+S to save)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!saving && formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saving]);

  /**
   * Initialize form with current personal info
   * Requirements: 7.1
   */
  useEffect(() => {
    if (personalInfo) {
      setFormData({
        name: personalInfo.name,
        tagline: personalInfo.tagline,
        description: personalInfo.description,
        linkedInUrl: personalInfo.linkedInUrl
      });
    }
  }, [personalInfo]);

  /**
   * Validate form data
   * Requirements: 7.2, 7.5
   * 
   * @param data - Form data to validate
   * @returns Validation errors object
   */
  const validateForm = (data: UpdatePersonalInfoRequest): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (data.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    // Tagline validation
    if (!data.tagline.trim()) {
      errors.tagline = 'Tagline is required';
    } else if (data.tagline.trim().length < 5) {
      errors.tagline = 'Tagline must be at least 5 characters';
    } else if (data.tagline.trim().length > 200) {
      errors.tagline = 'Tagline must be less than 200 characters';
    }

    // Description validation
    if (!data.description.trim()) {
      errors.description = 'Description is required';
    } else if (data.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (data.description.trim().length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    // LinkedIn URL validation
    if (!data.linkedInUrl.trim()) {
      errors.linkedInUrl = 'LinkedIn URL is required';
    } else {
      // Basic URL validation
      try {
        const url = new URL(data.linkedInUrl);
        if (!url.protocol.startsWith('http')) {
          errors.linkedInUrl = 'LinkedIn URL must start with http:// or https://';
        }
        // Check if it's a LinkedIn URL
        if (!url.hostname.includes('linkedin.com')) {
          errors.linkedInUrl = 'Must be a valid LinkedIn URL';
        }
      } catch {
        errors.linkedInUrl = 'Must be a valid URL';
      }
    }

    return errors;
  };

  /**
   * Handle input changes
   * Requirements: 7.1, 7.2
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
    
    // Clear success/error messages when user modifies form
    setSaveSuccess(false);
    setSaveError(null);
  };

  /**
   * Handle form submission
   * Requirements: 7.2, 7.3, 7.4, 7.5
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous messages
    setSaveSuccess(false);
    setSaveError(null);
    
    // Validate form
    // Requirements: 7.2, 7.5
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      // Requirements: 7.5 - Display validation errors and prevent saving
      setValidationErrors(errors);
      return;
    }
    
    // Clear validation errors
    setValidationErrors({});
    
    setSaving(true);
    
    try {
      // Requirements: 7.3, 7.4 - Save changes and immediately reflect updates
      await updatePersonalInfo(formData);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      // Requirements: 7.5 - Display error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="personal-info-form">
      <h2 className="personal-info-form-title">Edit Personal Information</h2>
      
      <form ref={formRef} onSubmit={handleSubmit} className="personal-info-form-content">
        {/* Name field */}
        <div className="personal-info-form-field">
          <label htmlFor="name" className="personal-info-form-label">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={saving}
            className={`personal-info-form-input ${validationErrors.name ? 'error' : ''}`}
            placeholder="Enter your name"
          />
          {validationErrors.name && (
            <span className="personal-info-form-error" role="alert">
              {validationErrors.name}
            </span>
          )}
        </div>

        {/* Tagline field */}
        <div className="personal-info-form-field">
          <label htmlFor="tagline" className="personal-info-form-label">
            Tagline *
          </label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            value={formData.tagline}
            onChange={handleChange}
            disabled={saving}
            className={`personal-info-form-input ${validationErrors.tagline ? 'error' : ''}`}
            placeholder="Enter your tagline"
          />
          {validationErrors.tagline && (
            <span className="personal-info-form-error" role="alert">
              {validationErrors.tagline}
            </span>
          )}
        </div>

        {/* Description field */}
        <div className="personal-info-form-field">
          <label htmlFor="description" className="personal-info-form-label">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={saving}
            className={`personal-info-form-textarea ${validationErrors.description ? 'error' : ''}`}
            placeholder="Enter your description"
            rows={6}
          />
          {validationErrors.description && (
            <span className="personal-info-form-error" role="alert">
              {validationErrors.description}
            </span>
          )}
        </div>

        {/* LinkedIn URL field */}
        <div className="personal-info-form-field">
          <label htmlFor="linkedInUrl" className="personal-info-form-label">
            LinkedIn URL *
          </label>
          <input
            id="linkedInUrl"
            name="linkedInUrl"
            type="url"
            value={formData.linkedInUrl}
            onChange={handleChange}
            disabled={saving}
            className={`personal-info-form-input ${validationErrors.linkedInUrl ? 'error' : ''}`}
            placeholder="https://www.linkedin.com/in/yourprofile"
          />
          {validationErrors.linkedInUrl && (
            <span className="personal-info-form-error" role="alert">
              {validationErrors.linkedInUrl}
            </span>
          )}
        </div>

        {/* Success message */}
        {saveSuccess && (
          <div className="personal-info-form-success" role="alert">
            Changes saved successfully!
          </div>
        )}

        {/* Error message */}
        {saveError && (
          <div className="personal-info-form-error-message" role="alert">
            {saveError}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={saving}
          className="personal-info-form-button"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
