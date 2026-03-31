import { Bus, Train, Car, Bike } from 'lucide-react';

export const FACILITY_TYPES = ['Bus Stop', 'Station', 'Parking', 'Bike Hub'];

// This makes your UI look high-end
export const getFacilityStyle = (type) => {
  const styles = {
    'Bus Stop': { color: 'text-green-600', bg: 'bg-green-50', icon: Bus },
    'Station': { color: 'text-blue-600', bg: 'bg-blue-50', icon: Train },
    'Parking': { color: 'text-purple-600', bg: 'bg-purple-50', icon: Car },
    'Bike Hub': { color: 'text-orange-600', bg: 'bg-orange-50', icon: Bike },
  };
  return styles[type] || styles['Bus Stop'];
};