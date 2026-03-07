/**
 * PlacesUpload component for adding a single place to an existing city
 */

import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Place, PlacesCategories } from '../types';
import './PlacesUpload.css';

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

export const PlacesUpload: React.FC = () => {
  const { cities, updateCity, getCityDetails } = useData();
  const [uploadText, setUploadText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setError(null);
    setSuccess(null);

    if (!uploadText.trim()) {
      setError('Please enter place details.');
      return;
    }

    const lines = uploadText.trim().split('\n');
    
    // Validate we have at least 3 lines (city, category, name)
    if (lines.length < 3) {
      setError('Missing required fields. Need at least: city, category, and place name (each on a new line).');
      return;
    }

    const cityName = lines[0]?.trim();
    const categoryInput = lines[1]?.trim();
    const placeName = lines[2]?.trim();
    const link = lines[3]?.trim() || '';
    const notes = lines[4]?.trim() || '';

    // Find city
    const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!city) {
      setError(`City "${cityName}" not found. Available cities: ${cities.map(c => c.name).join(', ')}`);
      return;
    }

    // Validate category
    const category = validCategories[categoryInput.toLowerCase()];
    if (!category) {
      setError(`Invalid category "${categoryInput}". Valid: bars, restaurants, poi, gyms, accommodations`);
      return;
    }

    // Validate place name
    if (!placeName) {
      setError('Place name is required.');
      return;
    }

    // Validate link if provided
    if (link) {
      try {
        new URL(link);
      } catch {
        setError(`Invalid URL "${link}". Must start with http:// or https://`);
        return;
      }
    }

    // Create the new place
    const newPlace: Place = {
      title: placeName,
      ...(link && { link }),
      ...(notes && { notes })
    };

    // Apply update
    setUploading(true);

    try {
      const cityDetails = await getCityDetails(city.id);
      
      const mergedPlaces = {
        bars: [...(cityDetails.places?.bars || [])],
        restaurants: [...(cityDetails.places?.restaurants || [])],
        pointsOfInterest: [...(cityDetails.places?.pointsOfInterest || [])],
        gyms: [...(cityDetails.places?.gyms || [])],
        accommodations: [...(cityDetails.places?.accommodations || [])]
      };
      
      // Add the new place to the appropriate category
      mergedPlaces[category].push(newPlace);

      await updateCity(city.id, {
        name: cityDetails.name,
        country: cityDetails.country,
        latitude: cityDetails.latitude,
        longitude: cityDetails.longitude,
        googleMapLink: cityDetails.googleMapLink,
        datesVisited: cityDetails.datesVisited,
        beforeYouGo: cityDetails.beforeYouGo,
        overview: cityDetails.overview,
        places: mergedPlaces
      });

      setSuccess(`Added "${placeName}" to ${city.name} (${category}).`);
      setUploadText('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save place');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="places-upload">
      <p className="places-upload-help">
        Enter one place with each field on a new line:
      </p>
      <ol className="places-upload-format">
        <li>City name</li>
        <li>Category (bars, restaurants, poi, gyms, accommodations)</li>
        <li>Place name</li>
        <li>Link (optional)</li>
        <li>Notes (optional)</li>
      </ol>
      <textarea
        className="places-upload-textarea"
        value={uploadText}
        onChange={(e) => setUploadText(e.target.value)}
        placeholder={`Tokyo
restaurants
Sukiyabashi Jiro
https://example.com
Amazing sushi`}
        rows={6}
        disabled={uploading}
      />
      {error && <div className="places-upload-error">{error}</div>}
      {success && <div className="places-upload-success">{success}</div>}
      <button
        className="admin-button admin-button-primary"
        onClick={handleUpload}
        disabled={uploading || !uploadText.trim()}
      >
        {uploading ? 'Adding...' : 'Add Place'}
      </button>
    </div>
  );
};

export default PlacesUpload;
