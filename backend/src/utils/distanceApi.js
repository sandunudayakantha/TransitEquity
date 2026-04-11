import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocode address to coordinates using Google Maps Geocoding API
 */
export const geocodeAddress = async (address) => {
  try {
    console.log(`🌍 Geocoding address via Google: "${address}"`);
    
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: address,
          key: API_KEY
        }
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const { lat, lng } = result.geometry.location;
      console.log(`✅ Found: lat ${lat}, lng ${lng}`);
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        formattedAddress: result.formatted_address
      };
    }
    
    console.log(`❌ No results found for: "${address}" (Status: ${response.data.status})`);
    return null;
  } catch (error) {
    console.error('Google Geocoding error:', error.message);
    return null;
  }
};

/**
 * Calculate driving distance using Google Distance Matrix API
 */
export const calculateDrivingDistance = async (origin, destination) => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          mode: 'driving',
          key: API_KEY
        }
      }
    );

    if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
      const distanceInMeters = response.data.rows[0].elements[0].distance.value;
      return parseFloat((distanceInMeters / 1000).toFixed(2));
    }

    console.log('⚠️ Google Distance Matrix returned non-OK status. Falling back.');
    return fallbackDistance(origin, destination);

  } catch (error) {
    console.error('Google Distance Matrix error:', error.message);
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