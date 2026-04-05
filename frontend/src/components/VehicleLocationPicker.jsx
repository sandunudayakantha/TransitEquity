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

const VehicleLocationPicker = ({ routePath = [], currentLocation, onLocationPick }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const stopMarkersRef = useRef([]);
  const vehicleMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const [mapError, setMapError] = useState('');

  // 1. Initialize Map
  useEffect(() => {
    let isMounted = true;
    const initializeMap = async () => {
      try {
        const maps = await loadGoogleMapsScript();
        if (!isMounted || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center: currentLocation?.lat && currentLocation?.lng ? currentLocation : DEFAULT_CENTER,
          zoom: 12,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          ],
          streetViewControl: false, mapTypeControl: false, fullscreenControl: false
        });

        map.addListener('click', (event) => {
          onLocationPick({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });

        if (isMounted) setMapInstance(map);
      } catch (error) {
        if (isMounted) setMapError(error.message);
      }
    };
    initializeMap();
    return () => { isMounted = false; };
  }, []);

  // 2. Draw Overlays (Stops, Polyline, Vehicle)
  useEffect(() => {
    if (!mapInstance) return;
    const maps = window.google.maps;

    // Clear existing Stop Markers
    stopMarkersRef.current.forEach(m => m.setMap(null));
    stopMarkersRef.current = [];

    const path = [];
    const bounds = new maps.LatLngBounds();

    // Draw Stop Markers
    routePath.forEach(area => {
      const pos = { lat: area.coordinates?.lat, lng: area.coordinates?.lng };
      if (!pos.lat || !pos.lng) return;

      const stopMarker = new maps.Marker({
        position: pos,
        map: mapInstance,
        title: area.name,
        icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: "#38bdf8",
          }
      });
      stopMarkersRef.current.push(stopMarker);
      path.push(pos);
      bounds.extend(pos);
    });

    // Draw Polyline
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (path.length > 1) {
      polylineRef.current = new maps.Polyline({
        path, geodesic: true, strokeColor: '#38bdf8', strokeWeight: 3, strokeOpacity: 0.8, map: mapInstance
      });
      
      // Fitting bounds only if we don't have a specific vehicle location yet
      if (!currentLocation?.lat || !currentLocation?.lng) {
        mapInstance.fitBounds(bounds);
      }
    }

    // Vehicle Marker (Arrow)
    if (vehicleMarkerRef.current) vehicleMarkerRef.current.setMap(null);
    if (currentLocation?.lat && currentLocation?.lng) {
      vehicleMarkerRef.current = new maps.Marker({
        position: { lat: Number(currentLocation.lat), lng: Number(currentLocation.lng) },
        map: mapInstance,
        title: 'Vehicle Position',
        icon: {
            path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: "#38bdf8",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          }
      });
    }
  }, [mapInstance, routePath, currentLocation?.lat, currentLocation?.lng]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <MapPin className="h-3 w-3 text-sky-400" />
        Click on the route to set vehicle location
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 h-64">
        {!mapInstance && !mapError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-white">
            <LoaderCircle className="mr-3 h-4 w-4 animate-spin" /> Loading route map...
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-950/20 text-red-400 p-4 text-center text-xs">
            {mapError}
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default VehicleLocationPicker;
