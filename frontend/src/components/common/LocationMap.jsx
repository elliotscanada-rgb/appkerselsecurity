import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaPlus, FaMinus, FaLocationArrow } from 'react-icons/fa';

// Fix Leaflet default marker icon issue with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Storage facility locations (default secure storage coordinates)
const STORAGE_FACILITIES = {
  'Secure Storage': { lat: 40.7589, lng: -73.9851, name: 'Kestrel Secure Vault - New York' },
  'Secure Vault': { lat: 51.5074, lng: -0.1278, name: 'Kestrel Secure Vault - London' },
  'Main Facility': { lat: 34.0522, lng: -118.2437, name: 'Kestrel Secure Vault - Los Angeles' },
  'Dubai Vault': { lat: 25.2048, lng: 55.2708, name: 'Kestrel Secure Vault - Dubai' },
  'Singapore Vault': { lat: 1.3521, lng: 103.8198, name: 'Kestrel Secure Vault - Singapore' },
  'Default': { lat: 40.7589, lng: -73.9851, name: 'Kestrel Secure Vault' },
};

// Get storage facility coordinates by name
const getStorageFacilityLocation = (locationName) => {
  if (!locationName) return STORAGE_FACILITIES['Default'];
  
  // Try exact match first
  if (STORAGE_FACILITIES[locationName]) {
    return STORAGE_FACILITIES[locationName];
  }
  
  // Try partial match
  const key = Object.keys(STORAGE_FACILITIES).find(k => 
    locationName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(locationName.toLowerCase())
  );
  
  return STORAGE_FACILITIES[key] || STORAGE_FACILITIES['Default'];
};

// Custom colored marker icon with pulsing animation
const createCustomIcon = (color, emoji = '📍', isPulsing = false) => {
  const pulseStyle = isPulsing ? 'animation: pulse 2s ease-in-out infinite;' : '';
  
  return L.divIcon({
    className: '',
    html: `
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: rotate(-45deg) scale(1); }
          50% { opacity: 0.8; transform: rotate(-45deg) scale(1.15); }
        }
      </style>
      <div style="
        background-color: ${color};
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        ${pulseStyle}
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">${emoji}</div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

// Component to auto-update map center when selectedAsset changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);
  return null;
};

// Zoom controls
const MapControls = () => {
  const map = useMap();
  return (
    <div style={{ position: 'absolute', bottom: '20px', right: '10px', zIndex: 1000 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => map.zoomIn()}
          style={{
            width: '32px', height: '32px', background: '#1f2937',
            border: '1px solid #374151', borderRadius: '6px',
            color: '#9ca3af', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >+</button>
        <button
          onClick={() => map.zoomOut()}
          style={{
            width: '32px', height: '32px', background: '#1f2937',
            border: '1px solid #374151', borderRadius: '6px',
            color: '#9ca3af', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >−</button>
      </div>
    </div>
  );
};

/**
 * LocationMap - Shows location tracking for consignments and shipments
 * 
 * Props:
 * - consignment: Show consignment in storage (vault location)
 * - shipment: Show shipment in transit (origin, current, destination)
 */
const LocationMap = ({ shipment, consignment }) => {
  const [mapCenter, setMapCenter] = useState([40.7589, -73.9851]); // Default: New York (Kestrel HQ)
  const [zoomLevel, setZoomLevel] = useState(6);
  const [markers, setMarkers] = useState([]);
  const [routePoints, setRoutePoints] = useState([]);
  const [hasLocations, setHasLocations] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    // Handle consignment tracking (storage location)
    if (consignment && !shipment) {
      const status = consignment.status;
      const currentLocation = consignment.current_location || 'Secure Storage';
      const storageFacility = getStorageFacilityLocation(currentLocation);
      
      const newMarkers = [];
      
      // Add storage facility marker with appropriate status
      const statusConfig = {
        'pending': { color: '#f59e0b', emoji: '⏳', label: 'Pending Processing' },
        'received': { color: '#3b82f6', emoji: '📦', label: 'Received' },
        'under_verification': { color: '#f59e0b', emoji: '🔍', label: 'Under Verification' },
        'verification_passed': { color: '#10b981', emoji: '✅', label: 'Verified' },
        'approved': { color: '#10b981', emoji: '✅', label: 'Approved' },
        'in_secure_storage': { color: '#8b5cf6', emoji: '🔐', label: 'In Secure Vault', isPulsing: true },
        'on_hold': { color: '#ef4444', emoji: '⏸️', label: 'On Hold' },
        'withdrawal_requested': { color: '#f59e0b', emoji: '📤', label: 'Withdrawal Requested' },
        'released': { color: '#10b981', emoji: '✅', label: 'Released' },
        'in_transit': { color: '#06b6d4', emoji: '🚚', label: 'In Transit' },
        'completed': { color: '#22c55e', emoji: '✅', label: 'Completed' },
        'delivered': { color: '#22c55e', emoji: '📬', label: 'Delivered' },
      };
      
      const config = statusConfig[status] || { color: '#6b7280', emoji: '📍', label: status };
      
      newMarkers.push({
        id: 'storage',
        lat: storageFacility.lat,
        lng: storageFacility.lng,
        color: config.color,
        label: config.label,
        address: storageFacility.name,
        city: currentLocation,
        country: '',
        emoji: config.emoji,
        isPulsing: config.isPulsing,
        consignment_number: consignment.consignment_number,
        item_name: consignment.item_name,
      });
      
      setMarkers(newMarkers);
      setRoutePoints([]);
      setMapCenter([storageFacility.lat, storageFacility.lng]);
      setZoomLevel(12);
      setHasLocations(true);
      setLocationStatus(`Your ${consignment.item_name} is currently ${config.label.toLowerCase()} at ${storageFacility.name}`);
      return;
    }

    // Handle shipment tracking (original logic)
    if (!shipment) return;

    const origin = shipment.origin_location;
    const current = shipment.current_location_data;
    const destination = shipment.destination_location;

    const newMarkers = [];
    const newRoute = [];

    // Add origin marker
    if (origin?.lat && origin?.lng) {
      newMarkers.push({
        id: 'origin',
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng),
        color: '#10b981',
        label: 'Origin',
        address: origin.address || 'Origin',
        city: origin.city || '',
        country: origin.country || '',
        emoji: '🟢',
      });
      newRoute.push([parseFloat(origin.lat), parseFloat(origin.lng)]);
    }

    // Add current location marker
    if (current?.lat && current?.lng) {
      newMarkers.push({
        id: 'current',
        lat: parseFloat(current.lat),
        lng: parseFloat(current.lng),
        color: '#06b6d4',
        label: 'Current Location',
        address: current.address || 'Current',
        city: current.city || '',
        country: current.country || '',
        emoji: '🔵',
        isPulsing: true,
        recorded_at: current.recorded_at,
      });
      newRoute.push([parseFloat(current.lat), parseFloat(current.lng)]);
    }

    // Add destination marker
    if (destination?.lat && destination?.lng) {
      newMarkers.push({
        id: 'destination',
        lat: parseFloat(destination.lat),
        lng: parseFloat(destination.lng),
        color: '#ef4444',
        label: 'Destination',
        address: destination.address || 'Destination',
        city: destination.city || '',
        country: destination.country || '',
        emoji: '🔴',
      });
      newRoute.push([parseFloat(destination.lat), parseFloat(destination.lng)]);
    }

    setMarkers(newMarkers);
    setRoutePoints(newRoute);

    if (newMarkers.length > 0) {
      setHasLocations(true);

      if (newMarkers.length === 1) {
        // Only one point - center on it
        setMapCenter([newMarkers[0].lat, newMarkers[0].lng]);
        setZoomLevel(10);
      } else {
        // Multiple points - calculate center
        const avgLat = newMarkers.reduce((s, m) => s + m.lat, 0) / newMarkers.length;
        const avgLng = newMarkers.reduce((s, m) => s + m.lng, 0) / newMarkers.length;
        setMapCenter([avgLat, avgLng]);

        // Auto zoom based on spread
        const latRange = Math.max(...newMarkers.map(m => m.lat)) - Math.min(...newMarkers.map(m => m.lat));
        const lngRange = Math.max(...newMarkers.map(m => m.lng)) - Math.min(...newMarkers.map(m => m.lng));
        const maxRange = Math.max(latRange, lngRange);
        if (maxRange > 30) setZoomLevel(4);
        else if (maxRange > 15) setZoomLevel(5);
        else if (maxRange > 7) setZoomLevel(6);
        else if (maxRange > 3) setZoomLevel(7);
        else if (maxRange > 1) setZoomLevel(9);
        else setZoomLevel(11);
      }
    } else {
      setHasLocations(false);
    }
  }, [shipment, consignment]);

  // Always render the map, just show an overlay if no locations
  return (
    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', width: '100%' }} className="h-64 sm:h-80 md:h-96 lg:h-[500px]">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <MapUpdater center={mapCenter} zoom={zoomLevel} />

        {/* Draw route line */}
        {routePoints.length >= 2 && (
          <Polyline
            positions={routePoints}
            color="#06b6d4"
            weight={3}
            opacity={0.8}
            dashArray="8, 6"
          />
        )}

        {/* Draw markers */}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={createCustomIcon(m.color, m.emoji, m.isPulsing)}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>{m.label}</p>
                {m.consignment_number && (
                  <p style={{ fontSize: '12px', color: '#374151', marginBottom: '2px' }}>
                    <strong>Consignment:</strong> {m.consignment_number}
                  </p>
                )}
                {m.item_name && (
                  <p style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>
                    <strong>Item:</strong> {m.item_name}
                  </p>
                )}
                <p style={{ fontSize: '13px', color: '#374151' }}>{m.address}</p>
                {(m.city || m.country) && (
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    {[m.city, m.country].filter(Boolean).join(', ')}
                  </p>
                )}
                {m.recorded_at && (
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Updated: {new Date(m.recorded_at).toLocaleString()}
                  </p>
                )}
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {m.lat.toFixed(5)}, {m.lng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapControls />
      </MapContainer>

      {/* Location Status Banner (for consignments in storage) */}
      {consignment && locationStatus && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px', right: '52px', zIndex: 1000,
          background: 'rgba(139, 92, 246, 0.95)', borderRadius: '8px',
          padding: '10px 14px', border: '1px solid rgba(255,255,255,0.3)',
          fontSize: '13px', backdropFilter: 'blur(4px)',
          color: 'white', fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          🔐 {locationStatus}
        </div>
      )}

      {/* Legend overlay */}
      {shipment && (
        <div style={{
          position: 'absolute', top: '12px', right: '52px', zIndex: 1000,
          background: 'rgba(17, 24, 39, 0.9)', borderRadius: '8px',
          padding: '10px 12px', border: '1px solid #374151',
          fontSize: '12px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#10b981' }}>
            <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></div>
            Origin
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#06b6d4' }}>
            <div style={{ width: '10px', height: '10px', background: '#06b6d4', borderRadius: '50%' }}></div>
            Current
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
            <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></div>
            Destination
          </div>
        </div>
      )}

      {/* No locations overlay */}
      {!hasLocations && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', borderRadius: '8px',
          backdropFilter: 'blur(2px)',
          pointerEvents: 'none',
        }}>
          <FaMapMarkerAlt style={{ fontSize: '36px', color: '#6b7280', marginBottom: '8px' }} />
          <p style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>No location data yet</p>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
            {shipment || consignment ? 'Location data will appear here when available' : 'Select a consignment to view map'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
