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
      bars: [{ title: 'Le Comptoir Général' }, { title: 'Candelaria' }, { title: 'Little Red Door' }],
      restaurants: [{ title: 'L\'Ami Jean' }, { title: 'Septime' }, { title: 'Le Chateaubriand' }],
      pointsOfInterest: [{ title: 'Eiffel Tower' }, { title: 'Louvre Museum' }, { title: 'Notre-Dame' }, { title: 'Sacré-Cœur' }, { title: 'Arc de Triomphe' }],
      gyms: [{ title: 'Basic-Fit' }, { title: 'Fitness Park' }],
      accommodations: [{ title: 'Hotel de Crillon' }, { title: 'Le Bristol Paris' }]
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
      bars: [{ title: 'Golden Gai' }, { title: 'Bar High Five' }, { title: 'Gen Yamamoto' }],
      restaurants: [{ title: 'Sukiyabashi Jiro' }, { title: 'Narisawa' }, { title: 'Den' }],
      pointsOfInterest: [{ title: 'Senso-ji Temple' }, { title: 'Shibuya Crossing' }, { title: 'Meiji Shrine' }, { title: 'Tokyo Skytree' }, { title: 'Tsukiji Market' }],
      gyms: [{ title: 'Gold\'s Gym' }, { title: 'Anytime Fitness' }],
      accommodations: [{ title: 'Park Hyatt Tokyo' }, { title: 'Aman Tokyo' }]
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
      bars: [{ title: 'Paradiso' }, { title: 'Dr. Stravinsky' }, { title: 'Bobby\'s Free' }],
      restaurants: [{ title: 'Tickets' }, { title: 'Disfrutar' }, { title: 'Moments' }],
      pointsOfInterest: [{ title: 'Sagrada Familia' }, { title: 'Park Güell' }, { title: 'La Rambla' }, { title: 'Gothic Quarter' }, { title: 'Casa Batlló' }],
      gyms: [{ title: 'DiR' }, { title: 'Holmes Place' }],
      accommodations: [{ title: 'Hotel Arts Barcelona' }, { title: 'Mandarin Oriental' }]
    },
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-07-13T00:00:00Z'
  }
];
