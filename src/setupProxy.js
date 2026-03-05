/**
 * Development proxy configuration
 * This file sets up mock API responses for local development
 */

const mockPersonalInfo = {
  id: 'personal-info',
  name: 'Michael Jan',
  tagline: 'Software Engineer & Travel Enthusiast',
  description: 'Passionate about building great software and exploring the world. This is a demo with mock data for local development.',
  linkedInUrl: 'https://www.linkedin.com/in/michaeljan',
  updatedAt: new Date().toISOString()
};

const mockCities = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    googleMapLink: 'https://maps.google.com/?q=Paris,France',
    datesVisited: ['2023-05-15', '2023-09-20'],
    beforeYouGo: 'Learn some basic French phrases. The metro is the best way to get around.',
    overview: 'The City of Light offers world-class museums, iconic architecture, and incredible cuisine.',
    places: {
      bars: [
        { title: 'Le Comptoir Général', link: 'https://maps.google.com/?q=Le+Comptoir+General+Paris', notes: 'Eclectic bar with a tropical vibe, great cocktails' },
        { title: 'Candelaria', link: 'https://maps.google.com/?q=Candelaria+Paris', notes: 'Hidden taqueria with a speakeasy bar in the back' }
      ],
      restaurants: [
        { title: "L'Ami Jean", link: 'https://maps.google.com/?q=Ami+Jean+Paris', notes: 'Basque bistro, legendary rice pudding dessert' },
        { title: 'Septime', link: 'https://maps.google.com/?q=Septime+Paris', notes: 'Book weeks ahead — one of the best in the city' }
      ],
      pointsOfInterest: [
        { title: 'Eiffel Tower', link: 'https://maps.google.com/?q=Eiffel+Tower+Paris', notes: 'Go at dusk for the best light' },
        { title: 'Louvre Museum', link: 'https://maps.google.com/?q=Louvre+Paris', notes: 'Book tickets online, arrive early' },
        { title: 'Notre-Dame', link: 'https://maps.google.com/?q=Notre+Dame+Paris', notes: 'Restoration ongoing but exterior still impressive' }
      ],
      gyms: [
        { title: 'Basic-Fit', link: 'https://maps.google.com/?q=Basic+Fit+Paris', notes: 'Day passes available, locations across the city' },
        { title: 'Fitness Park', link: 'https://maps.google.com/?q=Fitness+Park+Paris', notes: 'Well-equipped, affordable' }
      ],
      accommodations: [
        { title: 'Hotel de Crillon', link: 'https://maps.google.com/?q=Hotel+de+Crillon+Paris', notes: 'Iconic luxury hotel on Place de la Concorde' }
      ]
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
    beforeYouGo: 'Get a JR Pass for train travel. Download Google Translate.',
    overview: 'A fascinating blend of ultra-modern and traditional culture.',
    places: {
      bars: [
        { title: 'Golden Gai', link: 'https://maps.google.com/?q=Golden+Gai+Tokyo', notes: 'Maze of tiny bars in Shinjuku, each with its own personality' },
        { title: 'Bar High Five', link: 'https://maps.google.com/?q=Bar+High+Five+Tokyo', notes: 'World-class cocktail bar, reservation recommended' }
      ],
      restaurants: [
        { title: 'Sukiyabashi Jiro', link: 'https://maps.google.com/?q=Sukiyabashi+Jiro+Tokyo', notes: 'Legendary sushi, book months in advance' },
        { title: 'Narisawa', link: 'https://maps.google.com/?q=Narisawa+Tokyo', notes: 'Innovative Japanese cuisine, one of Asia\'s best' }
      ],
      pointsOfInterest: [
        { title: 'Senso-ji Temple', link: 'https://maps.google.com/?q=Sensoji+Temple+Tokyo', notes: 'Go early morning to avoid crowds' },
        { title: 'Shibuya Crossing', link: 'https://maps.google.com/?q=Shibuya+Crossing+Tokyo', notes: 'Watch from the Starbucks above for the best view' },
        { title: 'Meiji Shrine', link: 'https://maps.google.com/?q=Meiji+Shrine+Tokyo', notes: 'Peaceful forest walk in the middle of the city' }
      ],
      gyms: [
        { title: "Gold's Gym", link: 'https://maps.google.com/?q=Golds+Gym+Tokyo', notes: 'Multiple locations, day passes available' },
        { title: 'Anytime Fitness', link: 'https://maps.google.com/?q=Anytime+Fitness+Tokyo', notes: 'Convenient locations near major stations' }
      ],
      accommodations: [
        { title: 'Park Hyatt Tokyo', link: 'https://maps.google.com/?q=Park+Hyatt+Tokyo', notes: 'Iconic hotel from Lost in Translation, stunning city views' }
      ]
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
    datesVisited: ['2023-07-05'],
    beforeYouGo: 'Book Sagrada Familia tickets in advance. Learn basic Spanish.',
    overview: 'Gaudí\'s architectural masterpieces and beautiful beaches.',
    places: {
      bars: [
        { title: 'Paradiso', link: 'https://maps.google.com/?q=Paradiso+Barcelona', notes: 'Hidden behind a pastrami shop, world-renowned cocktails' },
        { title: 'Dr. Stravinsky', link: 'https://maps.google.com/?q=Dr+Stravinsky+Barcelona', notes: 'Creative cocktails in the El Born neighbourhood' }
      ],
      restaurants: [
        { title: 'Tickets', link: 'https://maps.google.com/?q=Tickets+Barcelona', notes: 'Albert Adrià\'s tapas bar, book months ahead' },
        { title: 'Disfrutar', link: 'https://maps.google.com/?q=Disfrutar+Barcelona', notes: 'One of the world\'s best restaurants, avant-garde tasting menu' }
      ],
      pointsOfInterest: [
        { title: 'Sagrada Família', link: 'https://maps.google.com/?q=Sagrada+Familia+Barcelona', notes: 'Book tickets online well in advance' },
        { title: 'Park Güell', link: 'https://maps.google.com/?q=Park+Guell+Barcelona', notes: 'Timed entry required for the monumental zone' },
        { title: 'Gothic Quarter', link: 'https://maps.google.com/?q=Gothic+Quarter+Barcelona', notes: 'Best explored on foot, easy to get lost in a good way' }
      ],
      gyms: [
        { title: 'DiR', link: 'https://maps.google.com/?q=DiR+Barcelona', notes: 'Premium gym chain with multiple locations' },
        { title: 'Holmes Place', link: 'https://maps.google.com/?q=Holmes+Place+Barcelona', notes: 'Well-equipped, day passes available' }
      ],
      accommodations: [
        { title: 'Hotel Arts Barcelona', link: 'https://maps.google.com/?q=Hotel+Arts+Barcelona', notes: 'Beachfront luxury, great pool and views' }
      ]
    },
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2023-07-13T00:00:00Z'
  },
  {
    id: '4',
    name: 'Osaka',
    country: 'Japan',
    latitude: 34.6937,
    longitude: 135.5023,
    googleMapLink: 'https://maps.google.com/?q=Osaka,Japan',
    datesVisited: ['2024-04-08'],
    beforeYouGo: 'Get an ICOCA card for trains and buses. Osaka is very walkable — comfortable shoes are a must.',
    overview: 'Japan\'s kitchen and comedy capital. Osaka is louder, friendlier, and more food-obsessed than Tokyo, with a street food scene that\'s hard to beat.',
    places: {
      bars: [
        { title: 'Bar Nayuta', link: 'https://maps.google.com/?q=Bar+Nayuta+Osaka', notes: 'Intimate craft cocktail bar in Shinsaibashi' },
        { title: 'The Bow Bar', link: 'https://maps.google.com/?q=The+Bow+Bar+Osaka', notes: 'Whisky-focused bar with an impressive selection' }
      ],
      restaurants: [
        { title: 'Ichiran Ramen', link: 'https://maps.google.com/?q=Ichiran+Ramen+Osaka', notes: 'Solo dining booths, rich tonkotsu broth' },
        { title: 'Mizuno Okonomiyaki', link: 'https://maps.google.com/?q=Mizuno+Okonomiyaki+Osaka', notes: 'Legendary okonomiyaki spot in Dotonbori since 1945' },
        { title: 'Kuromon Market', link: 'https://maps.google.com/?q=Kuromon+Market+Osaka', notes: 'Osaka\'s kitchen — fresh seafood, street food stalls' }
      ],
      pointsOfInterest: [
        { title: 'Dotonbori', link: 'https://maps.google.com/?q=Dotonbori+Osaka', notes: 'The neon heart of Osaka, best at night' },
        { title: 'Osaka Castle', link: 'https://maps.google.com/?q=Osaka+Castle', notes: 'Beautiful grounds, great for a morning walk' },
        { title: 'Shinsekai', link: 'https://maps.google.com/?q=Shinsekai+Osaka', notes: 'Retro neighbourhood, try kushikatsu here' }
      ],
      gyms: [
        { title: "Gold's Gym Shinsaibashi", link: 'https://maps.google.com/?q=Golds+Gym+Shinsaibashi+Osaka', notes: 'Day passes available' },
        { title: 'Anytime Fitness Namba', link: 'https://maps.google.com/?q=Anytime+Fitness+Namba+Osaka', notes: 'Convenient location near Namba station' }
      ],
      accommodations: [
        { title: 'Cross Hotel Osaka', link: 'https://maps.google.com/?q=Cross+Hotel+Osaka', notes: 'Great location in the city centre, stylish rooms' }
      ]
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-04-09T00:00:00Z'
  }
];

module.exports = function(app) {
  // Use express.json() middleware for parsing JSON bodies
  app.use(require('express').json());

  // Mock GET /api/personal
  app.get('/api/personal', (req, res) => {
    res.json({ data: mockPersonalInfo });
  });

  // Mock GET /api/cities
  app.get('/api/cities', (req, res) => {
    res.json({ data: mockCities });
  });

  // Mock GET /api/cities/:id
  app.get('/api/cities/:id', (req, res) => {
    const city = mockCities.find(c => c.id === req.params.id);
    if (city) {
      res.json({ data: city });
    } else {
      res.status(404).json({ error: { message: 'City not found' } });
    }
  });

  // Mock POST /api/admin/auth
  app.post('/api/admin/auth', (req, res) => {
    // Simple mock authentication
    res.json({
      token: 'mock-jwt-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    });
  });

  // Mock PUT /api/admin/personal
  app.put('/api/admin/personal', (req, res) => {
    // Persist changes to mockPersonalInfo
    Object.assign(mockPersonalInfo, req.body, { updatedAt: new Date().toISOString() });
    res.json({ data: mockPersonalInfo });
  });

  // Mock POST /api/admin/cities
  app.post('/api/admin/cities', (req, res) => {
    const newCity = {
      id: String(Date.now()), // Use timestamp for unique ID
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Persist to mockCities array
    mockCities.push(newCity);
    console.log(`[Mock API] Created city: ${newCity.name} (ID: ${newCity.id})`);
    res.json({ data: newCity });
  });

  // Mock PUT /api/admin/cities/:id
  app.put('/api/admin/cities/:id', (req, res) => {
    const cityIndex = mockCities.findIndex(c => c.id === req.params.id);
    if (cityIndex !== -1) {
      // Persist changes to the city in the array
      const updatedCity = {
        ...mockCities[cityIndex],
        ...req.body,
        id: req.params.id, // Preserve original ID
        updatedAt: new Date().toISOString()
      };
      mockCities[cityIndex] = updatedCity;
      console.log(`[Mock API] Updated city: ${updatedCity.name} (ID: ${updatedCity.id})`);
      res.json({ data: updatedCity });
    } else {
      res.status(404).json({ error: { message: 'City not found' } });
    }
  });

  // Mock DELETE /api/admin/cities/:id
  app.delete('/api/admin/cities/:id', (req, res) => {
    const cityIndex = mockCities.findIndex(c => c.id === req.params.id);
    if (cityIndex !== -1) {
      const deletedCity = mockCities.splice(cityIndex, 1)[0];
      console.log(`[Mock API] Deleted city: ${deletedCity.name} (ID: ${deletedCity.id})`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: { message: 'City not found' } });
    }
  });
};
