'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMapContext } from "@/providers/MapContext";

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

export default function CarList({ center, show}: CarListProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    filterByAutonomy, 
    filterByDoors,
    filterBySeats,
    routeDistance 
  } = useMapContext();

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
          
          // Appliquer les filtres
          let filteredCars = data;
          
          if (filterByAutonomy) {
            filteredCars = filteredCars.filter((car: Car) => car.autonomy >= routeDistance);
          }
          
          if (filterByDoors !== null) {
            filteredCars = filteredCars.filter((car: Car) => car.doors === filterByDoors);
          }
          
          if (filterBySeats !== null) {
            filteredCars = filteredCars.filter((car: Car) => car.seats === filterBySeats);
          }
          
          setCars(filteredCars);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
          setLoading(false);
        }
      };

      fetchCars();
    }
  }, [center, show, filterByAutonomy, filterByDoors, filterBySeats, routeDistance]);

  if (!show) return null;
  if (loading) return <div className="text-center p-4">Chargement des voitures disponibles...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (cars.length === 0) return <div className="text-center p-4">Aucune voiture disponible dans un rayon de 100km</div>;

  return (
    <div className="fixed left-0 top-0 h-full w-72 overflow-y-auto scrollbar-hide py-11">
      <div className="flex items-center justify-between px-8">
        <h2 className="text-sm text-gray-500">
          {cars.length} Résultat{cars.length > 1 ? 's' : ''}
        </h2>
      </div>

      <div className="flex flex-col gap-2 p-2 w-full">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-white text-black border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow w-full flex items-center"
          >
            {car.image && (
              <div className="relative h-16 w-16 mr-3 flex-shrink-0">
                <Image
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 400px) 50vw"
                  priority={true}
                />
              </div>
            )}
            <div className="flex-1 w-fit">
              <h3 className="text-xs font-bold mb-1 truncate">
                {car.brand} {car.model}
              </h3>
              <div className="flex flex-col w-fit text-[10px] gap-0.5">
                <p>Autonomie: {car.autonomy} km</p>
                <p>Distance: {car.distance.toFixed(1)} km</p>
              </div>
            </div>
            <div className="border-l w-fit border-gray-200 pl-3 ml-3">
              <div className="flex flex-col justify-center w-fit text-[10px] gap-0.5">
                <p>{car.seats} places</p>
                <p>{car.doors} portes</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 