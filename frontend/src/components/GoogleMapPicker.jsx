import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MapPin } from 'lucide-react';

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googleMapsScriptPromise = null;

const loadGoogleMapsScript = () => {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error('Missing Google Maps API key'));
  }

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-maps="true"]');

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google.maps), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = 'true';
      script.onload = () => resolve(window.google.maps);
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  }

  return googleMapsScriptPromise;
};

const GoogleMapPicker = ({ lat, lng, onChange, areaCenter = null, facilityType = 'Bus Stop', routePath = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const waypointsRef = useRef([]);
  const [mapState, setMapState] = useState({
    isLoading: true,
    error: '',
  });

  useEffect(() => {
    let isMounted = true;
    let clickListener = null;

    const initializeMap = async () => {
      try {
        const maps = await loadGoogleMapsScript();

        if (!isMounted || !mapRef.current) {
          return;
        }

        const startingPosition = {
          lat: Number.isFinite(lat) ? lat : DEFAULT_CENTER.lat,
          lng: Number.isFinite(lng) ? lng : DEFAULT_CENTER.lng,
        };

        const map = new maps.Map(mapRef.current, {
          center: startingPosition,
          zoom: Number.isFinite(lat) && Number.isFinite(lng) ? 12 : 8,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          ],
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        let iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        if (facilityType === 'Bus Stop') iconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        if (facilityType === 'Station') iconUrl = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
        if (facilityType === 'Parking') iconUrl = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        if (facilityType === 'Bike Hub') iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

        const marker = new maps.Marker({
          position: startingPosition,
          map,
          draggable: true,
          title: `Selected ${facilityType}`,
          icon: iconUrl,
        });

        clickListener = map.addListener('click', (event) => {
          const nextLat = event.latLng.lat();
          const nextLng = event.latLng.lng();
          marker.setPosition({ lat: nextLat, lng: nextLng });
          onChange(nextLat, nextLng);
        });

        marker.addListener('dragend', (event) => {
          onChange(event.latLng.lat(), event.latLng.lng());
        });

        // Initialize an empty polyline
        polylineRef.current = new maps.Polyline({
          path: [],
          geodesic: true,
          strokeColor: '#38bdf8',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        if (isMounted) {
          setMapState({
            isLoading: false,
            error: '',
          });
        }
      } catch (error) {
        if (isMounted) {
          setMapState({
            isLoading: false,
            error: error.message || 'Unable to load Google Maps',
          });
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (clickListener) {
        window.google?.maps?.event.removeListener(clickListener);
      }
    };
  }, [onChange]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    let iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (facilityType === 'Bus Stop') iconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    if (facilityType === 'Station') iconUrl = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
    if (facilityType === 'Parking') iconUrl = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    if (facilityType === 'Bike Hub') iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

    const nextPosition = { lat, lng };
    markerRef.current.setIcon(iconUrl);
    markerRef.current.setTitle(`Selected ${facilityType}`);
    markerRef.current.setPosition(nextPosition);
    mapInstanceRef.current.panTo(nextPosition);
  }, [lat, lng, facilityType]);

  useEffect(() => {
    if (!mapInstanceRef.current || !polylineRef.current || !window.google?.maps) return;

    // Clear existing waypoints
    waypointsRef.current.forEach(w => w.setMap(null));
    waypointsRef.current = [];

    const maps = window.google.maps;
    const path = routePath.map(p => ({ lat: p.lat, lng: p.lng }));
    polylineRef.current.setPath(path);
    
    if (path.length > 0) {
      const bounds = new maps.LatLngBounds();
      
      routePath.forEach(point => {
        const pos = { lat: point.lat, lng: point.lng };
        bounds.extend(pos);

        // Add a prominent waypoint marker for context
        const waypoint = new maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          title: point.name || 'Route Point',
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#38bdf8",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
          clickable: false,
        });
        waypointsRef.current.push(waypoint);
      });

      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [routePath, mapState.isLoading]);

  useEffect(() => {
    if (!mapInstanceRef.current || mapState.isLoading || !areaCenter || !areaCenter.lat) return;
    
    // Auto-center the map to the selected area if no explicit coordinates have been dragged/typed yet
    if (lat === null || String(lat) === '' || lng === null || String(lng) === '') {
      const nextPosition = { lat: areaCenter.lat, lng: areaCenter.lng };
      mapInstanceRef.current.panTo(nextPosition);
      mapInstanceRef.current.setZoom(14);
    }
  }, [areaCenter, lat, lng, mapState.isLoading]);

  if (mapState.error) {
    return (
      <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-5 text-sm text-amber-100">
        <p className="font-semibold">Google Maps is not available.</p>
        <p className="mt-2 text-amber-50/90">
          Set <code className="rounded bg-black/20 px-1 py-0.5">VITE_GOOGLE_MAPS_API_KEY</code> in the frontend environment to enable map selection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="h-4 w-4 text-sky-300" />
          Click the map or drag the marker to choose coordinates.
        </div>
        {routePath.length > 0 && (
          <div className="flex items-center gap-1.5 font-medium text-sky-400">
            <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></div>
            Transport Route Visualization Active
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
        {mapState.isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-slate-200">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
            Loading map...
          </div>
        ) : null}
        <div ref={mapRef} className="h-80 w-full" />
      </div>
    </div>
  );
};

export default GoogleMapPicker;
