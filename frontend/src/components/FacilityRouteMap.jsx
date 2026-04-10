import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MapPin } from 'lucide-react';

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };
const GOOGLE_MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googleMapsScriptPromise = null;

const loadGoogleMapsScript = () => {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!GOOGLE_MAP_KEY) {
    return Promise.reject(new Error('Missing Google Maps API key'));
  }

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

const getFacilityMarkerIcon = (maps, facilityType) => {
  const colors = {
    'Bus Stop': '#2563eb',
    Station: '#9333ea',
    Parking: '#f59e0b',
    'Bike Hub': '#16a34a',
  };

  return {
    path: maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: colors[facilityType] || '#ef4444',
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
  };
};

const getFacilityTypeTheme = (facilityType) => {
  const themes = {
    'Bus Stop': {
      color: '#2563eb',
      borderClass: 'border-blue-400/30',
      bgClass: 'bg-blue-500/15',
      textClass: 'text-blue-100',
      dotClass: 'bg-blue-400',
      label: 'Bus Stop',
    },
    Station: {
      color: '#9333ea',
      borderClass: 'border-violet-400/30',
      bgClass: 'bg-violet-500/15',
      textClass: 'text-violet-100',
      dotClass: 'bg-violet-400',
      label: 'Station',
    },
    Parking: {
      color: '#f59e0b',
      borderClass: 'border-amber-400/30',
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-100',
      dotClass: 'bg-amber-400',
      label: 'Parking',
    },
    'Bike Hub': {
      color: '#16a34a',
      borderClass: 'border-emerald-400/30',
      bgClass: 'bg-emerald-500/15',
      textClass: 'text-emerald-100',
      dotClass: 'bg-emerald-400',
      label: 'Bike Hub',
    },
  };

  return themes[facilityType] || themes['Bus Stop'];
};

const FacilityRouteMap = ({
  lat,
  lng,
  onChange,
  areaCenter = null,
  facilityType = 'Bus Stop',
  routePath = [],
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeMarkersRef = useRef([]);
  const polylineRef = useRef(null);
  const facilityMarkerRef = useRef(null);
  const [mapState, setMapState] = useState({ isLoading: true, error: '' });
  const facilityTheme = getFacilityTypeTheme(facilityType);

  useEffect(() => {
    let isMounted = true;
    let clickListener = null;

    const initializeMap = async () => {
      try {
        const maps = await loadGoogleMapsScript();
        if (!isMounted || !mapRef.current) {
          return;
        }

        const startPosition = {
          lat: Number.isFinite(lat) ? lat : Number(areaCenter?.lat) || DEFAULT_CENTER.lat,
          lng: Number.isFinite(lng) ? lng : Number(areaCenter?.lng) || DEFAULT_CENTER.lng,
        };

        const map = new maps.Map(mapRef.current, {
          center: startPosition,
          zoom: Number.isFinite(lat) && Number.isFinite(lng) ? 12 : 10,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          ],
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        const facilityMarker = new maps.Marker({
          position: startPosition,
          map,
          draggable: true,
          title: `Selected ${facilityType}`,
          icon: getFacilityMarkerIcon(maps, facilityType),
        });

        clickListener = map.addListener('click', (event) => {
          const nextLat = event.latLng.lat();
          const nextLng = event.latLng.lng();
          facilityMarker.setPosition({ lat: nextLat, lng: nextLng });
          if (onChange) {
            onChange(nextLat, nextLng);
          }
        });

        facilityMarker.addListener('dragend', (event) => {
          if (onChange) {
            onChange(event.latLng.lat(), event.latLng.lng());
          }
        });

        mapInstanceRef.current = map;
        facilityMarkerRef.current = facilityMarker;

        if (isMounted) {
          setMapState({ isLoading: false, error: '' });
        }
      } catch (error) {
        if (isMounted) {
          setMapState({ isLoading: false, error: error.message || 'Unable to load Google Maps' });
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
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !facilityMarkerRef.current || !window.google?.maps) {
      return;
    }

    const maps = window.google.maps;
    const nextPosition = {
      lat: Number.isFinite(lat) ? lat : Number(areaCenter?.lat) || DEFAULT_CENTER.lat,
      lng: Number.isFinite(lng) ? lng : Number(areaCenter?.lng) || DEFAULT_CENTER.lng,
    };

    facilityMarkerRef.current.setPosition(nextPosition);
    facilityMarkerRef.current.setTitle(`Selected ${facilityType}`);
    facilityMarkerRef.current.setIcon(getFacilityMarkerIcon(maps, facilityType));
    if (!routePath.length) {
      mapInstanceRef.current.panTo(nextPosition);
    }
  }, [lat, lng, facilityType, areaCenter, routePath.length]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) {
      return;
    }

    const maps = window.google.maps;

    routeMarkersRef.current.forEach((marker) => marker.setMap(null));
    routeMarkersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const bounds = new maps.LatLngBounds();
    let hasRoute = false;
    const path = [];

    routePath.forEach((point, index) => {
      const position = { lat: Number(point.lat), lng: Number(point.lng) };
      path.push(position);
      bounds.extend(position);
      hasRoute = true;

      const marker = new maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: point.name || `Route Point ${index + 1}`,
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontWeight: '700',
        },
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: facilityTheme.color,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });

      routeMarkersRef.current.push(marker);
    });

    if (path.length > 1) {
      polylineRef.current = new maps.Polyline({
        path,
        geodesic: true,
        strokeColor: facilityTheme.color,
        strokeOpacity: 1,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });
    }

    if (path.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      if (routePath.length <= 1) {
        mapInstanceRef.current.setZoom(12);
      }
    } else if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(12);
    } else if (hasRoute) {
      mapInstanceRef.current.fitBounds(bounds);
    } else if (areaCenter?.lat && areaCenter?.lng) {
      mapInstanceRef.current.setCenter({
        lat: Number(areaCenter.lat),
        lng: Number(areaCenter.lng),
      });
      mapInstanceRef.current.setZoom(14);
    }
  }, [routePath, lat, lng, areaCenter, facilityTheme.color]);

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
          <MapPin className="h-4 w-4 text-sky-400" />
          Click the map or drag the marker to choose coordinates.
        </div>
        {routePath.length > 0 ? (
          <div className="flex items-center gap-1.5 font-medium text-sky-400">
            <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Route Preview Active
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${facilityTheme.borderClass} ${facilityTheme.bgClass} ${facilityTheme.textClass}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${facilityTheme.dotClass}`} />
          {facilityTheme.label}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
          Placement marker
        </div>
      </div>
      <div className="relative h-80 overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
        {mapState.isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-white">
            <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
            Loading map...
          </div>
        ) : null}
        <div ref={mapRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default FacilityRouteMap;
