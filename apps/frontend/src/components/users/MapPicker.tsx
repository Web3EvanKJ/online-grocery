'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';

type MapPickerProps = {
  onSelectLocation: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
};

// Custom pin icon
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
});

function LocationMarker({
  onSelectLocation,
}: {
  onSelectLocation: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export const MapPicker = ({
  onSelectLocation,
  defaultLat,
  defaultLng,
}: MapPickerProps) => {
  const [center, setCenter] = useState<[number, number]>([
    defaultLat || -6.2,
    defaultLng || 106.816666,
  ]);

  useEffect(() => {
    if (defaultLat && defaultLng) {
      setCenter([defaultLat, defaultLng]);
    }
  }, [defaultLat, defaultLng]);

  return (
    <div className="h-72 w-full overflow-hidden rounded-lg border border-sky-200">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <LocationMarker onSelectLocation={onSelectLocation} />
      </MapContainer>
    </div>
  );
};
