import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MapPin } from 'lucide-react';

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };
const GOOGLE_MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googleMapsScriptPromise = null;

const loadGoogleMapsScript = () => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  if (!GOOGLE_MAP_KEY) return Promise.reject(new Error('Missing Google Maps API key'));

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  }

  return googleMapsScriptPromise;
};

const TransportRouteMap = ({ allAreas, selectedAreaIds, onAreaToggle }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [mapState, setMapState] = useState({ isLoading: true, error: '' });

  useEffect(() => {
    let isMounted = true;
    const initializeMap = async () => {
      try {
        const maps = await loadGoogleMapsScript();
        if (!isMounted || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: 10,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          ],
          streetViewControl: false, mapTypeControl: false, fullscreenControl: false
        });

        mapInstanceRef.current = map;
        if (isMounted) setMapState({ isLoading: false, error: '' });
      } catch (error) {
        if (isMounted) setMapState({ isLoading: false, error: error.message });
      }
    };
    initializeMap();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const maps = window.google.maps;

    // Clear existing
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    const bounds = new maps.LatLngBounds();
    let hasSelected = false;
    const path = [];

    allAreas.forEach(area => {
      const isSelected = selectedAreaIds.includes(area._id);
      const pos = { lat: area.coordinates.lat, lng: area.coordinates.lng };
      
      const marker = new maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        title: area.name,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: isSelected ? 8 : 4,
          fillColor: isSelected ? "#38bdf8" : "#64748b",
          fillOpacity: 1,
          strokeWeight: isSelected ? 2 : 1,
          strokeColor: "#ffffff",
        }
      });

      marker.addListener('click', () => {
        if (onAreaToggle) onAreaToggle(area._id);
      });

      markersRef.current.push(marker);
      if (isSelected) {
        bounds.extend(pos);
        hasSelected = true;
      }
    });

    // Draw Polyline in order
    selectedAreaIds.forEach(id => {
      const area = allAreas.find(a => a._id === id);
      if (area) path.push({ lat: area.coordinates.lat, lng: area.coordinates.lng });
    });

    if (path.length > 1) {
      polylineRef.current = new maps.Polyline({
        path, geodesic: true, strokeColor: '#38bdf8', strokeWeight: 3, map: mapInstanceRef.current
      });
    }

    if (hasSelected) {
      mapInstanceRef.current.fitBounds(bounds);
      if (selectedAreaIds.length === 1) mapInstanceRef.current.setZoom(12);
    }
  }, [allAreas, selectedAreaIds, onAreaToggle]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <MapPin className="h-4 w-4 text-sky-400" />
        Click markers to add/remove areas from the route.
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 h-96">
        {mapState.isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-white">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin" /> Loading map...
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default TransportRouteMap;
