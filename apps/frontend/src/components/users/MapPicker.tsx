'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import type { LatLng } from 'leaflet';
import type * as Leaflet from 'leaflet';

// Dynamically import only components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

import { useMapEvents } from 'react-leaflet';

// Lazy-load leaflet itself
let L: typeof Leaflet | null = null;
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet;
  });
}

type MapPickerProps = {
  onSelectLocation: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
};

function LocationMarker({
  onSelectLocation,
}: {
  onSelectLocation: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  if (!L || !position) return null;
  const markerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
  });

  return <Marker position={position} icon={markerIcon} />;
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

  if (typeof window === 'undefined') return null;

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
