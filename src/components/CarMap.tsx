'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction du problème d'icône par défaut de Leaflet
const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Car {
  id: number;
  lat: number;
  lng: number;
  name: string;
  model: string;
  brand: string;
  autonomy: number;
  available: boolean;
  image?: string;
}

interface CarMapProps {
  center: {
    lat: number;
    lng: number;
  };
}

export default function CarMap({ center }: CarMapProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(
          `/api/cars?lat=${center.lat}&lng=${center.lng}&radius=100`
        );
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des voitures');
        }
        const data = await response.json();
        setCars(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [center]);

  if (loading) return <div className="text-center p-4">Chargement des voitures...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {cars.map((car) => (
          <Marker
            key={car.id}
            position={[car.lat, car.lng]}
            icon={icon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{car.brand} {car.model}</h3>
                <p>Autonomie: {car.autonomy} km</p>
                {car.image && (
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-32 object-contain mt-2"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 