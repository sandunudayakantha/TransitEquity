import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const GapHeatmap = ({ reports = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    // Initialize map only once centered over Sri Lanka
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([7.8731, 80.7718], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Cleanup the map strictly on fully unmounting the component
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old layers to redraw efficiently with new prop changes
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }
    if (markersLayerRef.current) {
      mapInstanceRef.current.removeLayer(markersLayerRef.current);
    }

    const heatPoints = [];
    const markersGroup = L.layerGroup();

    // Ensure reports is an array before iterating
    const safeReports = Array.isArray(reports) ? reports : [];

    safeReports.forEach(report => {
      const coords = report?.areaId?.coordinates;
      if (!coords) return;

      let lat, lng;
      // Accommodate array [lat, lng] or raw coordinate objects
      if (Array.isArray(coords) && coords.length >= 2) {
         lat = coords[0];
         lng = coords[1];
      } else if (coords.lat !== undefined && coords.lng !== undefined) {
         lat = coords.lat;
         lng = coords.lng;
      } else {
         return; // Skip invalid nested coordinates
      }

      // Safeguard against missing/invalid lat/lng strings hiding as NaN 
      if (isNaN(lat) || isNaN(lng)) return;

      const gapScore = report.gapScore || 0;
      
      // Enforce requested intensity threshold logic (0 -> 1 cap maxing at 5000)
      let intensity = gapScore / 5000;
      intensity = Math.max(0, Math.min(intensity, 1)); 

      heatPoints.push([lat, lng, intensity]);

      // Add a hidden circle marker natively for elegant leaflet tooltip rendering
      const circleMarker = L.circleMarker([lat, lng], {
        radius: 12,
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0
      });
      
      const areaName = report.areaId?.name || 'Unknown Area';
      
      circleMarker.bindTooltip(
        `<div class="text-center font-sans tracking-tight">
          <strong class="text-gray-800 block mb-[2px]">${areaName}</strong>
          <span class="text-gray-600 font-medium text-sm">Gap Score: <span class="text-blue-600">${gapScore.toLocaleString()}</span></span>
        </div>`, 
        {
          direction: 'top',
          className: 'bg-white border-0 shadow-xl rounded-lg px-3 py-2 pointer-events-none',
          opacity: 0.95
        }
      );

      markersGroup.addLayer(circleMarker);
    });

    const gradient = {
      0.1: 'green',
      0.4: 'yellow',
      0.7: 'orange',
      1.0: 'red'
    };

    // Construct configured heatLayer per requirements
    heatLayerRef.current = L.heatLayer(heatPoints, {
      radius: 20,
      blur: 15,
      maxZoom: 18,
      max: 1.0,
      gradient: gradient
    }).addTo(mapInstanceRef.current);

    // Bind UI tooltip handlers to overlay above heat points automatically
    markersLayerRef.current = markersGroup.addTo(mapInstanceRef.current);

  }, [reports]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200/60 bg-gray-50 flex flex-col">
      <div 
        ref={mapRef} 
        className="w-full"
        style={{ height: '500px', zIndex: 1 }} 
      />
    </div>
  );
};

export default GapHeatmap;
