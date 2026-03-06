/**
 * PlacesUpload component for bulk adding places to existing cities
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
      setError('Please enter at least one line to upload.');
      return;
    }

    const lines = uploadText.trim().split('\n');
    const errors: string[] = [];
    const updates: Map<string, { city: typeof cities[0], places: Partial<Record<keyof PlacesCategories, Place[]>> }> = new Map();

    // Parse and validate all lines first
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV-like format
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim());

      // Validate minimum fields
      if (parts.length < 3) {
        errors.push(`Line ${i + 1}: Missing required fields. Format: city, category, place name, link (optional), notes (optional)`);
        continue;
      }

      const [cityName, categoryInput, placeName, link, notes] = parts.map(p => p.replace(/['"]/g, '').trim());

      // Find city
      const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
      if (!city) {
        errors.push(`Line ${i + 1}: City "${cityName}" not found. Available cities: ${cities.map(c => c.name).join(', ')}`);
        continue;
      }

      // Validate category
      const category = validCategories[categoryInput.toLowerCase()];
      if (!category) {
        errors.push(`Line ${i + 1}: Invalid category "${categoryInput}". Valid: bars, restaurants, poi, gyms, accommodations`);
        continue;
      }

      // Validate place name
      if (!placeName) {
        errors.push(`Line ${i + 1}: Place name is required.`);
        continue;
      }

      // Validate link if provided
      if (link) {
        try {
          new URL(link);
        } catch {
          errors.push(`Line ${i + 1}: Invalid URL "${link}".`);
          continue;
        }
      }

      // Group by city
      if (!updates.has(city.id)) {
        updates.set(city.id, { city, places: {} });
      }
      const cityUpdate = updates.get(city.id)!;
      if (!cityUpdate.places[category]) {
        cityUpdate.places[category] = [];
      }

      const newPlace: Place = {
        title: placeName,
        ...(link && { link }),
        ...(notes && { notes })
      };
      cityUpdate.places[category]!.push(newPlace);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    // Apply updates
    setUploading(true);
    let totalPlaces = 0;
    let citiesUpdated = 0;

    try {
      for (const [cityId, update] of updates) {
        const cityDetails = await getCityDetails(cityId);
        
        const mergedPlaces = {
          bars: [...(cityDetails.places.bars || []), ...(update.places.bars || [])],
          restaurants: [...(cityDetails.places.restaurants || []), ...(update.places.restaurants || [])],
          pointsOfInterest: [...(cityDetails.places.pointsOfInterest || []), ...(update.places.pointsOfInterest || [])],
          gyms: [...(cityDetails.places.gyms || []), ...(update.places.gyms || [])],
          accommodations: [...(cityDetails.places.accommodations || []), ...(update.places.accommodations || [])]
        };

        await updateCity(cityId, {
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

        const placesAdded = Object.values(update.places).reduce((sum, arr) => sum + (arr?.length || 0), 0);
        totalPlaces += placesAdded;
        citiesUpdated++;
      }

      setSuccess(`Added ${totalPlaces} place${totalPlaces !== 1 ? 's' : ''} to ${citiesUpdated} cit${citiesUpdated !== 1 ? 'ies' : 'y'}.`);
      setUploadText('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save updates');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="places-upload">
      <p className="places-upload-help">
        Format: <code>city, category, place name, link (optional), notes (optional)</code>
      </p>
      <textarea
        className="places-upload-textarea"
        value={uploadText}
        onChange={(e) => setUploadText(e.target.value)}
        placeholder={`Categories: bars, restaurants, poi, gyms, accommodations

Tokyo, restaurants, Sukiyabashi Jiro, https://example.com, Amazing sushi
Paris, bars, Le Comptoir
Barcelona, poi, Sagrada Familia`}
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
        {uploading ? 'Uploading...' : 'Upload Places'}
      </button>
    </div>
  );
};

export default PlacesUpload;
