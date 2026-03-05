/**
 * Mock data for local development
 * This file provides sample data when the backend API is not available
 */

import { PersonalInfo, City } from './types';

export const mockPersonalInfo: PersonalInfo = {
  id: 'personal-info',
  name: 'Michael Jan',
  tagline: 'Software Engineer & Travel Enthusiast',
  description: 'Passionate about building great software and exploring the world. This is a demo of the personal website with mock data for local development.',
  linkedInUrl: 'https://www.linkedin.com/in/michaeljan',
  updatedAt: new Date().toISOString()
};

export const mockCities: City[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    googleMapLink: 'https://maps.google.com/?q=Paris,France',
    datesVisited: ['2023-05-15', '2023-09-20'],
    beforeYouGo: 'Learn some basic French phrases. The metro is the best way to get around. Book museums in advance.',
    overview: 'The City of Light offers world-class museums, iconic architecture, and incredible cuisine. From the Eiffel Tower to charming cafes, Paris never disappoints.',
    places: {
      bars: 'Le Comptoir Général, Candelaria, Little Red Door',
      restaurants: 'L\'Ami Jean, Septime, Le Chateaubriand',
      pointsOfInterest: 'Eiffel Tower, Louvre Museum, Notre-Dame, Sacré-Cœur, Arc de Triomphe',
      gyms: 'Basic-Fit, Fitness Park',
      accommodations: 'Hotel de Crillon, Le Bristol Paris'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-09-21T00:00:00Z'
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    googleMapLink: 'https://maps.google.com/?q=Tokyo,Japan',
    datesVisited: ['2023-03-10'],
    beforeYouGo: 'Get a JR Pass for train travel. Download Google Translate. Cash is still king in many places.',
    overview: 'A fascinating blend of ultra-modern and traditional. Tokyo offers everything from ancient temples to cutting-edge technology, incredible food, and unique culture.',
    places: {
      bars: 'Golden Gai, Bar High Five, Gen Yamamoto',
      restaurants: 'Sukiyabashi Jiro, Narisawa, Den',
      pointsOfInterest: 'Senso-ji Temple, Shibuya Crossing, Meiji Shrine, Tokyo Skytree, Tsukiji Market',
      gyms: 'Gold\'s Gym, Anytime Fitness',
      accommodations: 'Park Hyatt Tokyo, Aman Tokyo'
    },
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-03-11T00:00:00Z'
  },
  {
    id: '3',
    name: 'Barcelona',
    country: 'Spain',
    latitude: 41.3851,
    longitude: 2.1734,
    googleMapLink: 'https://maps.google.com/?q=Barcelona,Spain',
    datesVisited: ['2023-07-05', '2023-07-12'],
    beforeYouGo: 'Book Sagrada Familia tickets weeks in advance. Learn basic Spanish. Beware of pickpockets in tourist areas.',
    overview: 'Gaudí\'s architectural masterpieces, beautiful beaches, vibrant nightlife, and delicious tapas make Barcelona an unforgettable destination.',
    places: {
      bars: 'Paradiso, Dr. Stravinsky, Bobby\'s Free',
      restaurants: 'Tickets, Disfrutar, Moments',
      pointsOfInterest: 'Sagrada Familia, Park Güell, La Rambla, Gothic Quarter, Casa Batlló',
      gyms: 'DiR, Holmes Place',
      accommodations: 'Hotel Arts Barcelona, Mandarin Oriental'
    },
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-07-13T00:00:00Z'
  }
];
