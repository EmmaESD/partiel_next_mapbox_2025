'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Car {
  id: number;
  name: string;
  model: string;
  brand: string;
  autonomy: number;
  available: boolean;
  image?: string;
  power?: number;
  seats?: number;
  doors?: number;
  year?: number;
  color?: string;
  distance: number;
}

interface CarListProps {
  center: {
    lat: number;
    lng: number;
  };
  show: boolean;
  onSelectCar?: (car: Car) => void;
}

export default function CarList({ center, show, onSelectCar }: CarListProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setLoading(true);
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
    }
  }, [center, show]);

  if (!show) return null;
  if (loading) return <div className="text-center p-4">Chargement des voitures disponibles...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (cars.length === 0) return <div className="text-center p-4">Aucune voiture disponible dans un rayon de 100km</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">
        {cars.length} voiture{cars.length > 1 ? 's' : ''} disponible{cars.length > 1 ? 's' : ''} dans un rayon de 100km
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {car.image && (
              <div className="relative h-48 w-full">
                <Image
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">
                {car.brand} {car.model}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="font-semibold">Distance:</span> {car.distance.toFixed(1)} km</p>
                <p><span className="font-semibold">Autonomie:</span> {car.autonomy} km</p>
                {car.power && <p><span className="font-semibold">Puissance:</span> {car.power} kW</p>}
                {car.seats && <p><span className="font-semibold">Places:</span> {car.seats}</p>}
                {car.doors && <p><span className="font-semibold">Portes:</span> {car.doors}</p>}
                {car.year && <p><span className="font-semibold">Année:</span> {car.year}</p>}
                {car.color && <p><span className="font-semibold">Couleur:</span> {car.color}</p>}
              </div>
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                onClick={() => onSelectCar?.(car)}
              >
                Sélectionner cette voiture
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 