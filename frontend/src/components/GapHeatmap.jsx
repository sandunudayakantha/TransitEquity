import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 7.8731,
  lng: 80.7718
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const LIBRARIES = [];

const GapHeatmap = ({ reports = [], onPointClick }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const [map, setMap] = useState(null);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Format data for deck.gl HeatmapLayer
  const deckData = useMemo(() => {
    return (Array.isArray(reports) ? reports : []).map(report => {
      const area = report.areaDetails || report.areaId;
      const coords = area?.coordinates;
      let lat, lng;

      if (Array.isArray(coords)) {
        lat = coords[0]; lng = coords[1];
      } else if (coords?.lat !== undefined) {
        lat = coords.lat; lng = coords.lng;
      } else return null;

      const gapScore = report.gapScore || 0;
      let intensity = gapScore / 5000;
      intensity = Math.max(0.1, Math.min(intensity, 1.0));

      return {
        position: [lng, lat], // deck.gl uses [longitude, latitude]
        weight: intensity
      };
    }).filter(p => p !== null);
  }, [reports]);

  // Initialize stable deck.gl Overlay instance
  const overlay = useMemo(() => {
    if (!isLoaded) return null;
    return new GoogleMapsOverlay();
  }, [isLoaded]);

  // Update Overlay Layers when data changes
  useEffect(() => {
    if (overlay && deckData) {
      overlay.setProps({
        layers: [
          new HeatmapLayer({
            id: 'gap-heatmap',
            data: deckData,
            getPosition: d => d.position,
            getWeight: d => d.weight,
            radiusPixels: 40,
            intensity: 1,
            threshold: 0.05,
            opacity: 0.6,
            colorRange: [
              [0, 255, 255], [0, 191, 255], [0, 127, 255], [0, 63, 255],
              [0, 0, 255], [63, 0, 191], [127, 0, 127], [191, 0, 63], [255, 0, 0]
            ]
          })
        ]
      });
    }
  }, [overlay, deckData]);

  // Manage Overlay Lifecycle on Map
  useEffect(() => {
    if (map && overlay) {
      overlay.setMap(map);
    }
    return () => {
      if (overlay) overlay.setMap(null);
    };
  }, [map, overlay]);

  // Extract markers for Radar Pulse overlays
  const markers = useMemo(() => {
    return (Array.isArray(reports) ? reports : []).map(report => {
      const area = report.areaDetails || report.areaId;
      const coords = area?.coordinates;
      let lat, lng;

      if (Array.isArray(coords)) {
        lat = coords[0]; lng = coords[1];
      } else if (coords?.lat !== undefined) {
        lat = coords.lat; lng = coords.lng;
      } else return null;

      return {
        id: report._id || Math.random().toString(),
        lat,
        lng,
        name: area?.name || 'Unknown Area',
        score: report.gapScore || 0,
        severity: report.severity,
        report
      };
    }).filter(m => m !== null);
  }, [reports]);

  if (loadError) return <div className="p-4 text-red-500 bg-red-50 rounded-xl">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="h-[500px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-black">Powering Up Maps...</div>;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200/60 bg-gray-50 flex flex-col">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onLoad={onMapLoad}
      >
        {markers.map(m => (
          <OverlayView
            key={m.id}
            position={{ lat: m.lat, lng: m.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div 
              className="cursor-pointer group"
              onClick={() => onPointClick && onPointClick(m.report)}
            >
              <div className={`radar-pulse ${m.severity === 'High' ? 'radar-pulse-high' : m.severity === 'Medium' ? 'radar-pulse-medium' : m.severity === 'Low' ? 'radar-pulse-low' : ''}`}>
                {/* Visual Tooltip */}
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-2 rounded-xl shadow-2xl border border-gray-100 whitespace-nowrap z-50 pointer-events-none">
                  <p className="text-xs font-black text-gray-900">{m.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Gap: <span className="text-blue-600">{m.score.toLocaleString()}</span></p>
                </div>
              </div>
            </div>
          </OverlayView>
        ))}
      </GoogleMap>
    </div>
  );
};

export default GapHeatmap;
