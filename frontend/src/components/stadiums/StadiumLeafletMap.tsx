import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix broken default marker icons in Vite builds.
// Leaflet's default icons use require() paths that Vite doesn't resolve.
// We import the PNGs explicitly and override the default icon options.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface StadiumLeafletMapProps {
  stadiumName: string;
  latitude: number;
  longitude: number;
}

// Interactive OpenStreetMap powered by Leaflet.
// Replaces the static OSM iframe from Phase 21 with pan/zoom and a stadium marker.
// No API key required — uses free OSM tile server.
export const StadiumLeafletMap: React.FC<StadiumLeafletMapProps> = ({
  stadiumName,
  latitude,
  longitude,
}) => (
  <MapContainer
    center={[latitude, longitude]}
    zoom={15}
    scrollWheelZoom={false}
    style={{ height: '360px', width: '100%' }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[latitude, longitude]}>
      <Popup>{stadiumName}</Popup>
    </Marker>
  </MapContainer>
);
