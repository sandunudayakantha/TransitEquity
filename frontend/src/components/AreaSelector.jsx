import React, { useState, useEffect, memo } from 'react';
import { fetchAreas } from '../lib/areas';

const AreaSelector = memo(({ onSelect, placeholder = "Select an area", disabled = false }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAreas = async () => {
      try {
        setLoading(true);
        setError(null);
        // Uses the existing service imported from lib/areas
        const response = await fetchAreas(1, 1000);
        if (isMounted) {
          setAreas(response.data || (Array.isArray(response) ? response : []));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load areas. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAreas();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      if (onSelect) onSelect(null);
      return;
    }
    // Match the selected ID with the area object safely referencing either _id or id
    const selectedArea = areas.find(a => String(a._id || a.id) === String(selectedId));
    if (onSelect) {
      onSelect(selectedArea || null);
    }
  };

  if (error) {
    return (
      <div className="w-full text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <select
        onChange={handleChange}
        disabled={disabled || loading}
        className={`w-full pl-4 pr-10 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          disabled || loading ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400 cursor-pointer'
        }`}
      >
        <option value="">
          {loading ? 'Loading areas...' : placeholder}
        </option>
        
        {areas.map((area) => {
          const id = area._id || area.id;
          const name = area.name || 'Unknown Area';
          const city = area.city || 'Unknown City';
          const population = typeof area.population !== 'undefined' 
            ? Number(area.population).toLocaleString() 
            : 'N/A';

          return (
            <option key={id} value={id}>
              {`${name} (${city}) - Pop: ${population}`}
            </option>
          );
        })}
      </select>
      
      {/* Custom dropdown arrow or spinner when loading */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-500">
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-blue-500 cursor-wait" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
});

AreaSelector.displayName = 'AreaSelector';

export default AreaSelector;
