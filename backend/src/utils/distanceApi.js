import axios from 'axios';

/**
 * Geocode address to coordinates using Nominatim (OpenStreetMap)
 */
export const geocodeAddress = async (address) => {
  try {
    console.log(`🌍 Geocoding address: "${address}"`);
    
    // Add a small delay to respect rate limits (1 request/second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'TransitEquity-App/1.0' // Identify your app
        }
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`✅ Found: lat ${result.lat}, lng ${result.lon}`);
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name
      };
    }
    
    console.log(`❌ No results found for: "${address}"`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

/**
 * Calculate driving distance using OSRM
 */
export const calculateDrivingDistance = async (origin, destination) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    
    const response = await axios.get(url, {
      params: {
        overview: 'false',
        alternatives: 'false',
        steps: 'false'
      }
    });

    if (response.data.code === 'Ok' && response.data.routes?.length > 0) {
      const distanceInMeters = response.data.routes[0].distance;
      return parseFloat((distanceInMeters / 1000).toFixed(2));
    }

    // Fallback if API fails
    return fallbackDistance(origin, destination);

  } catch (error) {
    console.error('OSRM API error:', error.message);
    return fallbackDistance(origin, destination);
  }
};

/**
 * Fallback distance calculation (straight line)
 */
const fallbackDistance = (origin, destination) => {
  const dist = Math.sqrt(
    Math.pow(destination.lat - origin.lat, 2) +
    Math.pow(destination.lng - origin.lng, 2)
  ) * 111;
  return parseFloat(dist.toFixed(2));
};