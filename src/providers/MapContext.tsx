"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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
  lat: number;
  lng: number;
}

interface MapContextType {
  startCoords: [number, number] | null;
  endCoords: [number, number] | null;
  setStartCoords: (coords: [number, number] | null) => void;
  setEndCoords: (coords: [number, number] | null) => void;
  triggerRoute: () => void;
  routeRequested: boolean;
  setRouteRequested: (value: boolean) => void;
  routeDistance: number;
  setRouteDistance: (distance: number) => void;
  cars: Car[];
  setCars: (cars: Car[]) => void;
  filterByAutonomy: boolean;
  setFilterByAutonomy: (value: boolean) => void;
  filterByDoors: number | null;
  setFilterByDoors: (value: number | null) => void;
  filterBySeats: number | null;
  setFilterBySeats: (value: number | null) => void;
}

const MapContext = createContext<MapContextType>({
  startCoords: null,
  endCoords: null,
  setStartCoords: () => {},
  setEndCoords: () => {},
  triggerRoute: () => {},
  routeRequested: false,
  setRouteRequested: () => {},
  routeDistance: 0,
  setRouteDistance: () => {},
  cars: [],
  setCars: () => {},
  filterByAutonomy: false,
  setFilterByAutonomy: () => {},
  filterByDoors: null,
  setFilterByDoors: () => {},
  filterBySeats: null,
  setFilterBySeats: () => {},
});

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [routeRequested, setRouteRequested] = useState(false);
  const [routeDistance, setRouteDistance] = useState(0);
  const [cars, setCars] = useState<Car[]>([]);
  const [filterByAutonomy, setFilterByAutonomy] = useState(false);
  const [filterByDoors, setFilterByDoors] = useState<number | null>(null);
  const [filterBySeats, setFilterBySeats] = useState<number | null>(null);

  const triggerRoute = () => {
    setRouteRequested(true);
  };

  return (
    <MapContext.Provider
      value={{
        startCoords,
        endCoords,
        setStartCoords,
        setEndCoords,
        triggerRoute,
        routeRequested,
        setRouteRequested,
        routeDistance,
        setRouteDistance,
        cars,
        setCars,
        filterByAutonomy,
        setFilterByAutonomy,
        filterByDoors,
        setFilterByDoors,
        filterBySeats,
        setFilterBySeats,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export const useMapContext = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};
