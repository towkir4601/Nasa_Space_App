// nasaApi.js
// Utility to fetch real NASA data for the Gamified "Transmission" popups

// Using the NASA DEMO_KEY. In production, teams get a real key.
const NASA_API_KEY = 'DEMO_KEY';

/**
 * Fetches a random photo from the Mars Rover API (Perseverance or Curiosity)
 * based on the rover and sol date.
 */
const FALLBACK_PHOTOS = [
  {
    url: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG',
    camera: 'Front Hazard Avoidance Camera',
    date: '2015-05-30',
    rover: 'Curiosity'
  },
  {
    url: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/rcam/RLB_486265291EDR_F0481570RHAZ00323M_.JPG',
    camera: 'Rear Hazard Avoidance Camera',
    date: '2015-05-30',
    rover: 'Curiosity'
  },
  {
    url: 'https://mars.nasa.gov/msl-raw-images/msss/01000/mcam/1000MR0044631300503690E01_DXXX.jpg',
    camera: 'Mast Camera',
    date: '2015-05-30',
    rover: 'Curiosity'
  }
];

export async function fetchRoverPhoto(rover = 'perseverance', sol = 1000) {
  try {
    const response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.photos.length);
        const photo = data.photos[randomIndex];
        return {
          url: photo.img_src,
          camera: photo.camera.full_name,
          date: photo.earth_date,
          rover: photo.rover.name
        };
      }
    }
    
    // Fallback if no photos or 404
    throw new Error('No photos or API down');
  } catch (error) {
    console.warn("NASA API Error, using fallback:", error);
    const randomIndex = Math.floor(Math.random() * FALLBACK_PHOTOS.length);
    return FALLBACK_PHOTOS[randomIndex];
  }
}
