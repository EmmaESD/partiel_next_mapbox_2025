"use client";

import React from "react";
import GeocoderInputs from "@/components/app/map/GeocoderInputs";
import MapDisplay from "@/components/app/map/MapDisplay";
import { useMapContext } from "@/providers/MapContext";
import CarList from "@/components/CarList";

// Interface pour le type de voiture
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

const Home: React.FC = () => {
  const { startCoords, endCoords } = useMapContext();

  const handleSelectCar = (car: Car) => {
    // TODO: Implémenter la logique de sélection de voiture
    console.log('Voiture sélectionnée:', car);
  };

  return (
    <div className="h-screen">
      <div className="fixed top-0 left-0 z-50 p-4 right-0 flex justify-center">
        <GeocoderInputs />
      </div>
      <div className="h-full">
        <MapDisplay />
      </div>
      {startCoords && endCoords && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 max-h-[50vh] overflow-y-auto">
          <CarList 
            center={{ lat: startCoords[1], lng: startCoords[0] }} 
            show={true} 
            onSelectCar={handleSelectCar}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
