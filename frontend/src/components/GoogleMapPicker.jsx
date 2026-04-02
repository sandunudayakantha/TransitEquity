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

const GoogleMapPicker = ({ lat, lng, onChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
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
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        const marker = new maps.Marker({
          position: startingPosition,
          map,
          draggable: true,
          title: 'Selected area',
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

    const nextPosition = { lat, lng };
    markerRef.current.setPosition(nextPosition);
    mapInstanceRef.current.panTo(nextPosition);
  }, [lat, lng]);

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
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <MapPin className="h-4 w-4 text-sky-300" />
        Click the map or drag the marker to choose coordinates.
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
