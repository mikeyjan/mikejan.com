/**
 * CityForm component for creating and editing cities
 * Requirements: 8.2-8.10, 9.1-9.7
 * 
 * This component provides a comprehensive form for city management:
 * - Renders form fields for all city properties
 * - Implements dynamic Place item management (add/remove places in each category)
 * - Handles save operation with geocoding
 * - Displays validation errors
 * - Shows geocoding in progress state
 * - Handles geocoding failures with manual coordinate option
 */

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { CreateCityRequest, City, PlacesCategories, Place } from '../types';
import './CityForm.css';

/**
 * Validation errors interface
 */
interface ValidationErrors {
  name?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  googleMapLink?: string;
  datesVisited?: string;
  beforeYouGo?: string;
  overview?: string;
  places?: {
    bars?: string;
    restaurants?: string;
    pointsOfInterest?: string;
    gyms?: string;
    accommodations?: string;
  };
}

/**
 * CityForm props
 */
interface CityFormProps {
  city?: City;  // If provided, form is in edit mode
  onSuccess?: () => void;  // Callback after successful save
  onCancel?: () => void;  // Callback when user cancels
}

/**
 * CityForm component
 * Requirements: 8.2-8.10, 9.1-9.7
 */
const CityForm: React.FC<CityFormProps> = ({ city, onSuccess, onCancel }) => {
  const { createCity, updateCity, getCityDetails } = useData();
  
  const isEditMode = !!city;
  
  // Loading state for fetching city details
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateCityRequest>({
    name: '',
    country: '',
    latitude: 0,
    longitude: 0,
    googleMapLink: '',
    datesVisited: [],
    beforeYouGo: '',
    overview: '',
    places: {
      bars: [],
      restaurants: [],
      pointsOfInterest: [],
      gyms: [],
      accommodations: []
    }
  });
  
  // Place input state for each category
  const [placeInputs, setPlaceInputs] = useState<Record<keyof PlacesCategories, { title: string; link: string; notes: string }>>({
    bars: { title: '', link: '', notes: '' },
    restaurants: { title: '', link: '', notes: '' },
    pointsOfInterest: { title: '', link: '', notes: '' },
    gyms: { title: '', link: '', notes: '' },
    accommodations: { title: '', link: '', notes: '' }
  });
  
  // UI state
  const [dateInput, setDateInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingFailed, setGeocodingFailed] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState(false);
  
  // Bulk import state
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportSuccess, setBulkImportSuccess] = useState<string | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  
  // Place editing state
  const [editingPlace, setEditingPlace] = useState<{ category: keyof PlacesCategories; index: number } | null>(null);
  const [editPlaceData, setEditPlaceData] = useState<{ title: string; link: string; notes: string }>({ title: '', link: '', notes: '' });
  
  // Collapsible section state (collapsed by default in edit mode)
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(!city);
  const [isContentExpanded, setIsContentExpanded] = useState(!city);
  
  // Form ref for programmatic submission
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Keyboard shortcut handler (Cmd+S / Ctrl+S to save)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!saving && !geocoding && formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saving, geocoding]);

  /**
   * Initialize form with city data in edit mode
   * Requirements: 8.4
   */
  useEffect(() => {
    if (city) {
      // Fetch full city details including places
      const fetchCityDetails = async () => {
        setLoadingDetails(true);
        try {
          const fullCity = await getCityDetails(city.id);
          
          // Ensure places has all required categories with fallback to empty arrays
          const defaultPlaces = {
            bars: [],
            restaurants: [],
            pointsOfInterest: [],
            gyms: [],
            accommodations: []
          };
          
          setFormData({
            name: fullCity.name || '',
            country: fullCity.country || '',
            latitude: fullCity.latitude || 0,
            longitude: fullCity.longitude || 0,
            googleMapLink: fullCity.googleMapLink || '',
            datesVisited: fullCity.datesVisited || [],
            beforeYouGo: fullCity.beforeYouGo || '',
            overview: fullCity.overview || '',
            places: {
              ...defaultPlaces,
              ...(fullCity.places || {})
            }
          });
        } catch (err) {
          // Fallback to basic city data if fetch fails
          const defaultPlaces = {
            bars: [],
            restaurants: [],
            pointsOfInterest: [],
            gyms: [],
            accommodations: []
          };
          
          setFormData({
            name: city.name || '',
            country: city.country || '',
            latitude: city.latitude || 0,
            longitude: city.longitude || 0,
            googleMapLink: city.googleMapLink || '',
            datesVisited: city.datesVisited || [],
            beforeYouGo: city.beforeYouGo || '',
            overview: city.overview || '',
            places: {
              ...defaultPlaces,
              ...(city.places || {})
            }
          });
        } finally {
          setLoadingDetails(false);
        }
      };
      
      fetchCityDetails();
      // In edit mode, coordinates are already set
      setManualCoordinates(true);
    }
  }, [city, getCityDetails]);

  /**
   * Validate form data
   * Requirements: 8.8
   * 
   * @param data - Form data to validate
   * @returns Validation errors object
   */
  const validateForm = (data: CreateCityRequest): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'City name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'City name must be at least 2 characters';
    } else if (data.name.trim().length > 100) {
      errors.name = 'City name must be less than 100 characters';
    }

    // Country validation
    if (!data.country.trim()) {
      errors.country = 'Country is required';
    } else if (data.country.trim().length < 2) {
      errors.country = 'Country must be at least 2 characters';
    } else if (data.country.trim().length > 100) {
      errors.country = 'Country must be less than 100 characters';
    }

    // Coordinates validation
    if (manualCoordinates || geocodingFailed) {
      if (data.latitude < -90 || data.latitude > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
      }
      if (data.longitude < -180 || data.longitude > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    // Google Map Link validation
    if (!data.googleMapLink.trim()) {
      errors.googleMapLink = 'Google Map link is required';
    } else {
      try {
        const url = new URL(data.googleMapLink);
        if (!url.protocol.startsWith('http')) {
          errors.googleMapLink = 'Must be a valid URL starting with http:// or https://';
        }
      } catch {
        errors.googleMapLink = 'Must be a valid URL';
      }
    }

    // Dates visited validation
    if (data.datesVisited.length === 0) {
      errors.datesVisited = 'At least one visit date is required';
    }

    // Before you go validation
    if (!data.beforeYouGo.trim()) {
      errors.beforeYouGo = 'Before you go section is required';
    } else if (data.beforeYouGo.trim().length < 10) {
      errors.beforeYouGo = 'Before you go must be at least 10 characters';
    }

    // Overview validation
    if (!data.overview.trim()) {
      errors.overview = 'Overview is required';
    } else if (data.overview.trim().length < 10) {
      errors.overview = 'Overview must be at least 10 characters';
    }

    return errors;
  };

  /**
   * Handle input changes
   * Requirements: 8.2
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'latitude' || name === 'longitude') {
      // Handle coordinate fields
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error for this field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
    
    // Clear success/error messages
    setSaveSuccess(false);
    setSaveError(null);
  };

  /**
   * Handle place input changes
   */
  const handlePlaceInputChange = (
    category: keyof PlacesCategories,
    field: 'title' | 'link' | 'notes',
    value: string
  ) => {
    setPlaceInputs(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  /**
   * Add a place to a category
   */
  const handleAddPlace = (category: keyof PlacesCategories) => {
    const input = placeInputs[category];
    if (!input.title.trim()) return;

    const newPlace: Place = {
      title: input.title.trim(),
      ...(input.link.trim() && { link: input.link.trim() }),
      ...(input.notes.trim() && { notes: input.notes.trim() })
    };

    setFormData(prev => ({
      ...prev,
      places: {
        ...prev.places,
        [category]: [...prev.places[category], newPlace]
      }
    }));

    // Clear the input
    setPlaceInputs(prev => ({
      ...prev,
      [category]: { title: '', link: '', notes: '' }
    }));
  };

  /**
   * Remove a place from a category
   */
  const handleRemovePlace = (category: keyof PlacesCategories, index: number) => {
    setFormData(prev => ({
      ...prev,
      places: {
        ...prev.places,
        [category]: prev.places[category].filter((_, i) => i !== index)
      }
    }));
  };

  /**
   * Start editing a place
   */
  const handleEditPlace = (category: keyof PlacesCategories, index: number) => {
    const place = formData.places[category][index];
    setEditingPlace({ category, index });
    setEditPlaceData({
      title: place.title,
      link: place.link || '',
      notes: place.notes || ''
    });
  };

  /**
   * Save edited place
   */
  const handleSaveEditPlace = () => {
    if (!editingPlace || !editPlaceData.title.trim()) return;
    
    const { category, index } = editingPlace;
    const updatedPlace: Place = {
      title: editPlaceData.title.trim(),
      ...(editPlaceData.link.trim() && { link: editPlaceData.link.trim() }),
      ...(editPlaceData.notes.trim() && { notes: editPlaceData.notes.trim() })
    };

    setFormData(prev => ({
      ...prev,
      places: {
        ...prev.places,
        [category]: prev.places[category].map((p, i) => i === index ? updatedPlace : p)
      }
    }));
    
    setEditingPlace(null);
    setEditPlaceData({ title: '', link: '', notes: '' });
  };

  /**
   * Cancel editing a place
   */
  const handleCancelEditPlace = () => {
    setEditingPlace(null);
    setEditPlaceData({ title: '', link: '', notes: '' });
  };

  /**
   * Valid category names for bulk import
   */
  const validCategories: Record<string, keyof PlacesCategories> = {
    'bars': 'bars',
    'bar': 'bars',
    'restaurants': 'restaurants',
    'restaurant': 'restaurants',
    'pointsofinterest': 'pointsOfInterest',
    'poi': 'pointsOfInterest',
    'points of interest': 'pointsOfInterest',
    'gyms': 'gyms',
    'gym': 'gyms',
    'accommodations': 'accommodations',
    'accommodation': 'accommodations',
    'hotel': 'accommodations',
    'hotels': 'accommodations'
  };

  /**
   * Handle bulk import of places
   * Format: "category", "place name", "link", "notes"
   */
  const handleBulkImport = async () => {
    setBulkImportError(null);
    setBulkImportSuccess(null);
    
    if (!bulkImportText.trim()) {
      setBulkImportError('Please enter at least one line to import.');
      return;
    }

    const lines = bulkImportText.trim().split('\n');
    const newPlaces: Partial<Record<keyof PlacesCategories, Place[]>> = {
      bars: [],
      restaurants: [],
      pointsOfInterest: [],
      gyms: [],
      accommodations: []
    };
    const errors: string[] = [];

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines

      // Parse CSV-like format with quotes
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < trimmedLine.length; i++) {
        const char = trimmedLine[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim()); // Add last part

      // Validate minimum fields (category and place name are required)
      if (parts.length < 2) {
        errors.push(`Line ${lineIndex + 1}: Missing required fields. Format: "category", "place name", "link" (optional), "notes" (optional)`);
        return;
      }

      const [categoryInput, placeName, link, notes] = parts;
      
      // Validate category
      const normalizedCategory = categoryInput.toLowerCase().replace(/['"]/g, '').trim();
      const category = validCategories[normalizedCategory];
      
      if (!category) {
        errors.push(`Line ${lineIndex + 1}: Invalid category "${categoryInput}". Valid categories: bars, restaurants, pointsOfInterest (or poi), gyms, accommodations`);
        return;
      }

      // Validate place name
      const cleanPlaceName = placeName.replace(/['"]/g, '').trim();
      if (!cleanPlaceName) {
        errors.push(`Line ${lineIndex + 1}: Place name is required.`);
        return;
      }

      // Clean optional fields
      const cleanLink = link ? link.replace(/['"]/g, '').trim() : '';
      const cleanNotes = notes ? notes.replace(/['"]/g, '').trim() : '';

      // Validate link if provided
      if (cleanLink) {
        try {
          new URL(cleanLink);
        } catch {
          errors.push(`Line ${lineIndex + 1}: Invalid URL "${cleanLink}". Must be a valid URL starting with http:// or https://`);
          return;
        }
      }

      // Add to new places
      const newPlace: Place = {
        title: cleanPlaceName,
        ...(cleanLink && { link: cleanLink }),
        ...(cleanNotes && { notes: cleanNotes })
      };

      newPlaces[category]!.push(newPlace);
    });

    if (errors.length > 0) {
      setBulkImportError(errors.join('\n'));
      return;
    }

    // Count total places imported
    const totalImported = Object.values(newPlaces).reduce((sum, arr) => sum + (arr?.length || 0), 0);

    // Merge new places with existing and auto-save
    const updatedPlaces = {
      bars: [...formData.places.bars, ...(newPlaces.bars || [])],
      restaurants: [...formData.places.restaurants, ...(newPlaces.restaurants || [])],
      pointsOfInterest: [...formData.places.pointsOfInterest, ...(newPlaces.pointsOfInterest || [])],
      gyms: [...formData.places.gyms, ...(newPlaces.gyms || [])],
      accommodations: [...formData.places.accommodations, ...(newPlaces.accommodations || [])]
    };

    const updatedFormData = {
      ...formData,
      places: updatedPlaces
    };

    // Update local state
    setFormData(updatedFormData);

    // Auto-save if in edit mode
    if (isEditMode && city) {
      setBulkImporting(true);
      try {
        await updateCity(city.id, updatedFormData);
        setBulkImportSuccess(`Successfully imported ${totalImported} place${totalImported !== 1 ? 's' : ''} and saved!`);
        setBulkImportText('');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setBulkImportSuccess(null);
        }, 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save city';
        setBulkImportError(`Import successful but failed to save: ${errorMessage}`);
      } finally {
        setBulkImporting(false);
      }
    } else {
      // Not in edit mode, just update local state
      setBulkImportSuccess(`Added ${totalImported} place${totalImported !== 1 ? 's' : ''}. Don't forget to save!`);
      setBulkImportText('');
      
      setTimeout(() => {
        setBulkImportSuccess(null);
      }, 3000);
    }
  };

  /**
   * Handle date input
   * Requirements: 9.3
   */
  const handleAddDate = () => {
    if (dateInput.trim()) {
      setFormData(prev => ({
        ...prev,
        datesVisited: [...prev.datesVisited, dateInput.trim()]
      }));
      setDateInput('');
      
      // Clear date validation error
      if (validationErrors.datesVisited) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.datesVisited;
          return newErrors;
        });
      }
    }
  };

  /**
   * Handle date removal
   * Requirements: 9.3
   */
  const handleRemoveDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      datesVisited: prev.datesVisited.filter((_, i) => i !== index)
    }));
  };

  /**
   * Handle manual coordinate toggle
   * Requirements: 8.10
   */
  const handleManualCoordinatesToggle = () => {
    setManualCoordinates(!manualCoordinates);
    setGeocodingFailed(false);
  };

  /**
   * Handle form submission
   * Requirements: 8.3, 8.5, 8.8, 8.9, 8.10
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous messages
    setSaveSuccess(false);
    setSaveError(null);
    
    // Validate form
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      // Requirements: 8.8 - Display validation errors and prevent saving
      setValidationErrors(errors);
      return;
    }
    
    // Clear validation errors
    setValidationErrors({});
    
    setSaving(true);
    
    try {
      if (isEditMode && city) {
        // Requirements: 8.5 - Update existing city
        await updateCity(city.id, formData);
      } else {
        // Requirements: 8.3 - Create new city
        // Note: Backend handles geocoding if coordinates are 0,0
        await createCity(formData);
      }
      
      setSaveSuccess(true);
      
      // Call success callback after a brief delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
    } catch (err) {
      // Requirements: 8.8, 8.10 - Handle errors including geocoding failures
      const errorMessage = err instanceof Error ? err.message : 'Failed to save city';
      
      // Check if it's a geocoding error
      if (errorMessage.includes('geocoding') || errorMessage.includes('coordinates')) {
        setGeocodingFailed(true);
        setManualCoordinates(true);  // Automatically enable manual coordinates
        setSaveError('Geocoding failed. Please enter coordinates manually.');
      } else {
        setSaveError(errorMessage);
      }
    } finally {
      setSaving(false);
      setGeocoding(false);
    }
  };

  if (loadingDetails) {
    return (
      <div className="city-form">
        <h2 className="city-form-title">Edit City</h2>
        <div className="city-form-loading">
          <div className="loading-spinner"></div>
          <p>Loading city details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="city-form">
      <h2 className="city-form-title">
        {isEditMode ? 'Edit City' : 'Add New City'}
      </h2>
      
      <form ref={formRef} onSubmit={handleSubmit} className="city-form-content">
        {/* Basic Information Section */}
        <div className={`city-form-section ${isEditMode ? 'city-form-section-collapsible' : ''}`}>
          {isEditMode ? (
            <button
              type="button"
              className="city-form-section-toggle"
              onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
              aria-expanded={isBasicInfoExpanded}
            >
              <h3 className="city-form-section-title">Basic Information</h3>
              <span className={`city-form-section-chevron ${isBasicInfoExpanded ? 'expanded' : ''}`}>▼</span>
            </button>
          ) : (
            <h3 className="city-form-section-title">Basic Information</h3>
          )}
          
          {(!isEditMode || isBasicInfoExpanded) && (
            <div className={isEditMode ? 'city-form-section-content' : ''}>
          {/* Name field */}
          <div className="city-form-field">
            <label htmlFor="name" className="city-form-label">
              City Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              className={`city-form-input ${validationErrors.name ? 'error' : ''}`}
              placeholder="e.g., Paris"
            />
            {validationErrors.name && (
              <span className="city-form-error" role="alert">
                {validationErrors.name}
              </span>
            )}
          </div>

          {/* Country field */}
          <div className="city-form-field">
            <label htmlFor="country" className="city-form-label">
              Country *
            </label>
            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              disabled={saving}
              className={`city-form-input ${validationErrors.country ? 'error' : ''}`}
              placeholder="e.g., France"
            />
            {validationErrors.country && (
              <span className="city-form-error" role="alert">
                {validationErrors.country}
              </span>
            )}
          </div>

          {/* Coordinates section */}
          <div className="city-form-coordinates">
            <div className="city-form-coordinates-header">
              <label className="city-form-label">Coordinates</label>
              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleManualCoordinatesToggle}
                  className="city-form-toggle-button"
                  disabled={saving}
                >
                  {manualCoordinates ? 'Use Automatic Geocoding' : 'Enter Manually'}
                </button>
              )}
            </div>
            
            {(manualCoordinates || geocodingFailed || isEditMode) && (
              <div className="city-form-coordinates-inputs">
                <div className="city-form-field">
                  <label htmlFor="latitude" className="city-form-label">
                    Latitude *
                  </label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    disabled={saving}
                    className={`city-form-input ${validationErrors.latitude ? 'error' : ''}`}
                    placeholder="e.g., 48.8566"
                  />
                  {validationErrors.latitude && (
                    <span className="city-form-error" role="alert">
                      {validationErrors.latitude}
                    </span>
                  )}
                </div>

                <div className="city-form-field">
                  <label htmlFor="longitude" className="city-form-label">
                    Longitude *
                  </label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    disabled={saving}
                    className={`city-form-input ${validationErrors.longitude ? 'error' : ''}`}
                    placeholder="e.g., 2.3522"
                  />
                  {validationErrors.longitude && (
                    <span className="city-form-error" role="alert">
                      {validationErrors.longitude}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {!manualCoordinates && !isEditMode && (
              <p className="city-form-help-text">
                Coordinates will be automatically determined from city and country name.
              </p>
            )}
          </div>

          {/* Google Map Link field */}
          <div className="city-form-field">
            <label htmlFor="googleMapLink" className="city-form-label">
              Google Map Link *
            </label>
            <input
              id="googleMapLink"
              name="googleMapLink"
              type="url"
              value={formData.googleMapLink}
              onChange={handleChange}
              disabled={saving}
              className={`city-form-input ${validationErrors.googleMapLink ? 'error' : ''}`}
              placeholder="https://maps.google.com/..."
            />
            {validationErrors.googleMapLink && (
              <span className="city-form-error" role="alert">
                {validationErrors.googleMapLink}
              </span>
            )}
          </div>

          {/* Dates Visited field */}
          <div className="city-form-field">
            <label htmlFor="dateInput" className="city-form-label">
              Dates Visited *
            </label>
            <div className="city-form-date-input">
              <input
                id="dateInput"
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDate();
                  }
                }}
                disabled={saving}
                className="city-form-input"
                placeholder="e.g., June 2023"
              />
              <button
                type="button"
                onClick={handleAddDate}
                disabled={saving || !dateInput.trim()}
                className="city-form-add-button"
              >
                Add Date
              </button>
            </div>
            {validationErrors.datesVisited && (
              <span className="city-form-error" role="alert">
                {validationErrors.datesVisited}
              </span>
            )}
            {formData.datesVisited.length > 0 && (
              <div className="city-form-dates-list">
                {formData.datesVisited.map((date, index) => (
                  <div key={index} className="city-form-date-item">
                    <span>{date}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDate(index)}
                      disabled={saving}
                      className="city-form-remove-button"
                      aria-label={`Remove date ${date}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className={`city-form-section ${isEditMode ? 'city-form-section-collapsible' : ''}`}>
          {isEditMode ? (
            <button
              type="button"
              className="city-form-section-toggle"
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              aria-expanded={isContentExpanded}
            >
              <h3 className="city-form-section-title">Content</h3>
              <span className={`city-form-section-chevron ${isContentExpanded ? 'expanded' : ''}`}>▼</span>
            </button>
          ) : (
            <h3 className="city-form-section-title">Content</h3>
          )}
          
          {(!isEditMode || isContentExpanded) && (
            <div className={isEditMode ? 'city-form-section-content' : ''}>
          {/* Before You Go field */}
          <div className="city-form-field">
            <label htmlFor="beforeYouGo" className="city-form-label">
              Before You Go *
            </label>
            <textarea
              id="beforeYouGo"
              name="beforeYouGo"
              value={formData.beforeYouGo}
              onChange={handleChange}
              disabled={saving}
              className={`city-form-textarea ${validationErrors.beforeYouGo ? 'error' : ''}`}
              placeholder="Travel tips and important information..."
              rows={4}
            />
            {validationErrors.beforeYouGo && (
              <span className="city-form-error" role="alert">
                {validationErrors.beforeYouGo}
              </span>
            )}
          </div>

          {/* Overview field */}
          <div className="city-form-field">
            <label htmlFor="overview" className="city-form-label">
              Overview *
            </label>
            <textarea
              id="overview"
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              disabled={saving}
              className={`city-form-textarea ${validationErrors.overview ? 'error' : ''}`}
              placeholder="General overview of the city..."
              rows={6}
            />
            {validationErrors.overview && (
              <span className="city-form-error" role="alert">
                {validationErrors.overview}
              </span>
            )}
          </div>
            </div>
          )}
        </div>

        {/* Places Section */}
        <div className="city-form-section">
          <h3 className="city-form-section-title">Places to Visit</h3>
          
          {/* Bars */}
          <div className="city-form-field">
            <label className="city-form-label">Bars</label>
            <div className="city-form-place-input">
              <input
                type="text"
                value={placeInputs.bars.title}
                onChange={(e) => handlePlaceInputChange('bars', 'title', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Place name"
              />
              <input
                type="url"
                value={placeInputs.bars.link}
                onChange={(e) => handlePlaceInputChange('bars', 'link', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Link (optional)"
              />
              <input
                type="text"
                value={placeInputs.bars.notes}
                onChange={(e) => handlePlaceInputChange('bars', 'notes', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Notes (optional)"
              />
              <button
                type="button"
                onClick={() => handleAddPlace('bars')}
                disabled={saving || !placeInputs.bars.title.trim()}
                className="city-form-add-button"
              >
                Add
              </button>
            </div>
            {formData.places.bars.length > 0 && (
              <div className="city-form-places-list">
                {formData.places.bars.map((place, index) => (
                  <div key={index} className="city-form-place-item">
                    {editingPlace?.category === 'bars' && editingPlace?.index === index ? (
                      <div className="city-form-place-edit">
                        <input
                          type="text"
                          value={editPlaceData.title}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, title: e.target.value }))}
                          className="city-form-input"
                          placeholder="Place name"
                        />
                        <input
                          type="url"
                          value={editPlaceData.link}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, link: e.target.value }))}
                          className="city-form-input"
                          placeholder="Link (optional)"
                        />
                        <input
                          type="text"
                          value={editPlaceData.notes}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, notes: e.target.value }))}
                          className="city-form-input"
                          placeholder="Notes (optional)"
                        />
                        <div className="city-form-place-edit-actions">
                          <button type="button" onClick={handleSaveEditPlace} className="city-form-save-button">Save</button>
                          <button type="button" onClick={handleCancelEditPlace} className="city-form-cancel-button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="city-form-place-info">
                          <span className="city-form-place-title">{place.title}</span>
                          {place.link && <a href={place.link} target="_blank" rel="noopener noreferrer" className="city-form-place-link">🔗</a>}
                          {place.notes && <span className="city-form-place-notes">{place.notes}</span>}
                        </div>
                        <div className="city-form-place-actions">
                          <button
                            type="button"
                            onClick={() => handleEditPlace('bars', index)}
                            disabled={saving}
                            className="city-form-edit-button"
                            aria-label={`Edit ${place.title}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace('bars', index)}
                            disabled={saving}
                            className="city-form-remove-button"
                            aria-label={`Remove ${place.title}`}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Restaurants */}
          <div className="city-form-field">
            <label className="city-form-label">Restaurants</label>
            <div className="city-form-place-input">
              <input
                type="text"
                value={placeInputs.restaurants.title}
                onChange={(e) => handlePlaceInputChange('restaurants', 'title', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Place name"
              />
              <input
                type="url"
                value={placeInputs.restaurants.link}
                onChange={(e) => handlePlaceInputChange('restaurants', 'link', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Link (optional)"
              />
              <input
                type="text"
                value={placeInputs.restaurants.notes}
                onChange={(e) => handlePlaceInputChange('restaurants', 'notes', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Notes (optional)"
              />
              <button
                type="button"
                onClick={() => handleAddPlace('restaurants')}
                disabled={saving || !placeInputs.restaurants.title.trim()}
                className="city-form-add-button"
              >
                Add
              </button>
            </div>
            {formData.places.restaurants.length > 0 && (
              <div className="city-form-places-list">
                {formData.places.restaurants.map((place, index) => (
                  <div key={index} className="city-form-place-item">
                    {editingPlace?.category === 'restaurants' && editingPlace?.index === index ? (
                      <div className="city-form-place-edit">
                        <input
                          type="text"
                          value={editPlaceData.title}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, title: e.target.value }))}
                          className="city-form-input"
                          placeholder="Place name"
                        />
                        <input
                          type="url"
                          value={editPlaceData.link}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, link: e.target.value }))}
                          className="city-form-input"
                          placeholder="Link (optional)"
                        />
                        <input
                          type="text"
                          value={editPlaceData.notes}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, notes: e.target.value }))}
                          className="city-form-input"
                          placeholder="Notes (optional)"
                        />
                        <div className="city-form-place-edit-actions">
                          <button type="button" onClick={handleSaveEditPlace} className="city-form-save-button">Save</button>
                          <button type="button" onClick={handleCancelEditPlace} className="city-form-cancel-button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="city-form-place-info">
                          <span className="city-form-place-title">{place.title}</span>
                          {place.link && <a href={place.link} target="_blank" rel="noopener noreferrer" className="city-form-place-link">🔗</a>}
                          {place.notes && <span className="city-form-place-notes">{place.notes}</span>}
                        </div>
                        <div className="city-form-place-actions">
                          <button
                            type="button"
                            onClick={() => handleEditPlace('restaurants', index)}
                            disabled={saving}
                            className="city-form-edit-button"
                            aria-label={`Edit ${place.title}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace('restaurants', index)}
                            disabled={saving}
                            className="city-form-remove-button"
                            aria-label={`Remove ${place.title}`}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points of Interest */}
          <div className="city-form-field">
            <label className="city-form-label">Points of Interest</label>
            <div className="city-form-place-input">
              <input
                type="text"
                value={placeInputs.pointsOfInterest.title}
                onChange={(e) => handlePlaceInputChange('pointsOfInterest', 'title', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Place name"
              />
              <input
                type="url"
                value={placeInputs.pointsOfInterest.link}
                onChange={(e) => handlePlaceInputChange('pointsOfInterest', 'link', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Link (optional)"
              />
              <input
                type="text"
                value={placeInputs.pointsOfInterest.notes}
                onChange={(e) => handlePlaceInputChange('pointsOfInterest', 'notes', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Notes (optional)"
              />
              <button
                type="button"
                onClick={() => handleAddPlace('pointsOfInterest')}
                disabled={saving || !placeInputs.pointsOfInterest.title.trim()}
                className="city-form-add-button"
              >
                Add
              </button>
            </div>
            {formData.places.pointsOfInterest.length > 0 && (
              <div className="city-form-places-list">
                {formData.places.pointsOfInterest.map((place, index) => (
                  <div key={index} className="city-form-place-item">
                    {editingPlace?.category === 'pointsOfInterest' && editingPlace?.index === index ? (
                      <div className="city-form-place-edit">
                        <input
                          type="text"
                          value={editPlaceData.title}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, title: e.target.value }))}
                          className="city-form-input"
                          placeholder="Place name"
                        />
                        <input
                          type="url"
                          value={editPlaceData.link}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, link: e.target.value }))}
                          className="city-form-input"
                          placeholder="Link (optional)"
                        />
                        <input
                          type="text"
                          value={editPlaceData.notes}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, notes: e.target.value }))}
                          className="city-form-input"
                          placeholder="Notes (optional)"
                        />
                        <div className="city-form-place-edit-actions">
                          <button type="button" onClick={handleSaveEditPlace} className="city-form-save-button">Save</button>
                          <button type="button" onClick={handleCancelEditPlace} className="city-form-cancel-button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="city-form-place-info">
                          <span className="city-form-place-title">{place.title}</span>
                          {place.link && <a href={place.link} target="_blank" rel="noopener noreferrer" className="city-form-place-link">🔗</a>}
                          {place.notes && <span className="city-form-place-notes">{place.notes}</span>}
                        </div>
                        <div className="city-form-place-actions">
                          <button
                            type="button"
                            onClick={() => handleEditPlace('pointsOfInterest', index)}
                            disabled={saving}
                            className="city-form-edit-button"
                            aria-label={`Edit ${place.title}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace('pointsOfInterest', index)}
                            disabled={saving}
                            className="city-form-remove-button"
                            aria-label={`Remove ${place.title}`}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gyms */}
          <div className="city-form-field">
            <label className="city-form-label">Gyms</label>
            <div className="city-form-place-input">
              <input
                type="text"
                value={placeInputs.gyms.title}
                onChange={(e) => handlePlaceInputChange('gyms', 'title', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Place name"
              />
              <input
                type="url"
                value={placeInputs.gyms.link}
                onChange={(e) => handlePlaceInputChange('gyms', 'link', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Link (optional)"
              />
              <input
                type="text"
                value={placeInputs.gyms.notes}
                onChange={(e) => handlePlaceInputChange('gyms', 'notes', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Notes (optional)"
              />
              <button
                type="button"
                onClick={() => handleAddPlace('gyms')}
                disabled={saving || !placeInputs.gyms.title.trim()}
                className="city-form-add-button"
              >
                Add
              </button>
            </div>
            {formData.places.gyms.length > 0 && (
              <div className="city-form-places-list">
                {formData.places.gyms.map((place, index) => (
                  <div key={index} className="city-form-place-item">
                    {editingPlace?.category === 'gyms' && editingPlace?.index === index ? (
                      <div className="city-form-place-edit">
                        <input
                          type="text"
                          value={editPlaceData.title}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, title: e.target.value }))}
                          className="city-form-input"
                          placeholder="Place name"
                        />
                        <input
                          type="url"
                          value={editPlaceData.link}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, link: e.target.value }))}
                          className="city-form-input"
                          placeholder="Link (optional)"
                        />
                        <input
                          type="text"
                          value={editPlaceData.notes}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, notes: e.target.value }))}
                          className="city-form-input"
                          placeholder="Notes (optional)"
                        />
                        <div className="city-form-place-edit-actions">
                          <button type="button" onClick={handleSaveEditPlace} className="city-form-save-button">Save</button>
                          <button type="button" onClick={handleCancelEditPlace} className="city-form-cancel-button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="city-form-place-info">
                          <span className="city-form-place-title">{place.title}</span>
                          {place.link && <a href={place.link} target="_blank" rel="noopener noreferrer" className="city-form-place-link">🔗</a>}
                          {place.notes && <span className="city-form-place-notes">{place.notes}</span>}
                        </div>
                        <div className="city-form-place-actions">
                          <button
                            type="button"
                            onClick={() => handleEditPlace('gyms', index)}
                            disabled={saving}
                            className="city-form-edit-button"
                            aria-label={`Edit ${place.title}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace('gyms', index)}
                            disabled={saving}
                            className="city-form-remove-button"
                            aria-label={`Remove ${place.title}`}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accommodations */}
          <div className="city-form-field">
            <label className="city-form-label">Accommodations</label>
            <div className="city-form-place-input">
              <input
                type="text"
                value={placeInputs.accommodations.title}
                onChange={(e) => handlePlaceInputChange('accommodations', 'title', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Place name"
              />
              <input
                type="url"
                value={placeInputs.accommodations.link}
                onChange={(e) => handlePlaceInputChange('accommodations', 'link', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Link (optional)"
              />
              <input
                type="text"
                value={placeInputs.accommodations.notes}
                onChange={(e) => handlePlaceInputChange('accommodations', 'notes', e.target.value)}
                disabled={saving}
                className="city-form-input"
                placeholder="Notes (optional)"
              />
              <button
                type="button"
                onClick={() => handleAddPlace('accommodations')}
                disabled={saving || !placeInputs.accommodations.title.trim()}
                className="city-form-add-button"
              >
                Add
              </button>
            </div>
            {formData.places.accommodations.length > 0 && (
              <div className="city-form-places-list">
                {formData.places.accommodations.map((place, index) => (
                  <div key={index} className="city-form-place-item">
                    {editingPlace?.category === 'accommodations' && editingPlace?.index === index ? (
                      <div className="city-form-place-edit">
                        <input
                          type="text"
                          value={editPlaceData.title}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, title: e.target.value }))}
                          className="city-form-input"
                          placeholder="Place name"
                        />
                        <input
                          type="url"
                          value={editPlaceData.link}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, link: e.target.value }))}
                          className="city-form-input"
                          placeholder="Link (optional)"
                        />
                        <input
                          type="text"
                          value={editPlaceData.notes}
                          onChange={(e) => setEditPlaceData(prev => ({ ...prev, notes: e.target.value }))}
                          className="city-form-input"
                          placeholder="Notes (optional)"
                        />
                        <div className="city-form-place-edit-actions">
                          <button type="button" onClick={handleSaveEditPlace} className="city-form-save-button">Save</button>
                          <button type="button" onClick={handleCancelEditPlace} className="city-form-cancel-button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="city-form-place-info">
                          <span className="city-form-place-title">{place.title}</span>
                          {place.link && <a href={place.link} target="_blank" rel="noopener noreferrer" className="city-form-place-link">🔗</a>}
                          {place.notes && <span className="city-form-place-notes">{place.notes}</span>}
                        </div>
                        <div className="city-form-place-actions">
                          <button
                            type="button"
                            onClick={() => handleEditPlace('accommodations', index)}
                            disabled={saving}
                            className="city-form-edit-button"
                            aria-label={`Edit ${place.title}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePlace('accommodations', index)}
                            disabled={saving}
                            className="city-form-remove-button"
                            aria-label={`Remove ${place.title}`}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Import */}
          <div className="city-form-field city-form-bulk-import">
            <label htmlFor="bulkImport" className="city-form-label">
              Bulk Import Places
            </label>
            <p className="city-form-help-text">
              Add multiple places at once. Each line should follow this format:<br />
              <code>"category", "place name", "link", "notes"</code><br />
              Categories: bars, restaurants, pointsOfInterest (or poi), gyms, accommodations<br />
              Link and notes are optional.
            </p>
            <textarea
              id="bulkImport"
              value={bulkImportText}
              onChange={(e) => {
                setBulkImportText(e.target.value);
                setBulkImportError(null);
                setBulkImportSuccess(null);
              }}
              disabled={saving || bulkImporting}
              className={`city-form-textarea ${bulkImportError ? 'error' : ''}`}
              placeholder={`"restaurants", "Le Petit Bistro", "https://example.com", "Great French cuisine"\n"bars", "The Local Pub", "", "Cozy atmosphere"\n"poi", "Eiffel Tower", "https://toureiffel.paris"`}
              rows={5}
            />
            {bulkImportError && (
              <div className="city-form-error city-form-bulk-error" role="alert">
                {bulkImportError.split('\n').map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            )}
            {bulkImportSuccess && (
              <div className="city-form-bulk-success" role="status">
                ✓ {bulkImportSuccess}
              </div>
            )}
            <button
              type="button"
              onClick={handleBulkImport}
              disabled={saving || bulkImporting || !bulkImportText.trim()}
              className="city-form-add-button city-form-bulk-button"
            >
              {bulkImporting ? 'Importing & Saving...' : 'Import Places'}
            </button>
          </div>
        </div>

        {/* Geocoding in progress message */}
        {geocoding && (
          <div className="city-form-info-message" role="status">
            Determining coordinates...
          </div>
        )}

        {/* Success message */}
        {saveSuccess && (
          <div className="city-form-success" role="alert">
            City {isEditMode ? 'updated' : 'created'} successfully!
          </div>
        )}

        {/* Error message */}
        {saveError && (
          <div className="city-form-error-message" role="alert">
            {saveError}
          </div>
        )}

        {/* Form actions */}
        <div className="city-form-actions">
          <button
            type="submit"
            disabled={saving || geocoding}
            className="city-form-button city-form-button-primary"
          >
            {saving ? 'Saving...' : isEditMode ? 'Update City' : 'Create City'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving || geocoding}
              className="city-form-button city-form-button-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CityForm;
