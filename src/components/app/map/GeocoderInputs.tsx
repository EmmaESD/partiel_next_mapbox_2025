"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useMapContext } from "@/providers/MapContext";
import { Search, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const GeocoderInputs: React.FC = () => {
  const geocoderStartContainer = useRef<HTMLDivElement>(null);
  const geocoderEndContainer = useRef<HTMLDivElement>(null);
  const { 
    setStartCoords, 
    setEndCoords, 
    triggerRoute, 
    startCoords, 
    endCoords, 
    routeDistance,
    setFilterByAutonomy,
    filterByAutonomy,
    setFilterByDoors,
    setFilterBySeats,
  } = useMapContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [options, setOptions] = useState({
    filterByAutonomy: false,
    filterByDoors: false,
    filterBySeats: false,
    doorsCount: 3,
    seatsCount: 2,
  });

  useEffect(() => {
    if (geocoderStartContainer.current && mapboxgl.accessToken) {
      const geocoderStart = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken as string,
        mapboxgl: mapboxgl as any,
        placeholder: "Adresse de départ",
        marker: false,
      });
      geocoderStart.addTo(geocoderStartContainer.current);
      geocoderStart.on(
        "result",
        (e: { result: { center: [number, number] } }) => {
          const coords: [number, number] = e.result.center;
          console.log("coords:", coords);
          setStartCoords(coords);
        }
      );

      if (geocoderStartContainer.current) {
        const input = geocoderStartContainer.current.querySelector('input');
        if (input) {
          input.style.opacity = '0.8';
          input.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        }
      }
    }

    if (geocoderEndContainer.current && mapboxgl.accessToken) {
      const geocoderEnd = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken as string,
        mapboxgl: mapboxgl as any,
        placeholder: "Adresse d'arrivée",
        marker: false,
      });
      geocoderEnd.addTo(geocoderEndContainer.current);
      geocoderEnd.on(
        "result",
        (e: { result: { center: [number, number] } }) => {
          const coords: [number, number] = e.result.center;
          setEndCoords(coords);
        }
      );

      if (geocoderEndContainer.current) {
        const input = geocoderEndContainer.current.querySelector('input');
        if (input) {
          input.style.opacity = '0.5';
          input.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        }
      }
    }
  }, [setStartCoords, setEndCoords]);

  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      filterByAutonomy: filterByAutonomy
    }));
  }, [filterByAutonomy]);

  const handleClick = () => {
    if (!startCoords || !endCoords) {
      alert("Veuillez sélectionner les deux adresses.");
      return;
    }
    setFilterByAutonomy(false);
    setOptions(prev => ({
      ...prev,
      filterByAutonomy: false
    }));
    triggerRoute();
  };

  const handleOptionChange = (option: keyof typeof options) => {
    const newValue = !options[option];
    setOptions(prev => ({
      ...prev,
      [option]: newValue
    }));
    
    if (option === 'filterByAutonomy') {
      setFilterByAutonomy(newValue);
    }
  };

  const handleValidateFilters = () => {
    if (options.filterByAutonomy && routeDistance > 0) {
      setFilterByAutonomy(true);
    } else {
      setFilterByAutonomy(false);
    }

    if (options.filterByDoors) {
      setFilterByDoors(options.doorsCount);
    } else {
      setFilterByDoors(null);
    }

    if (options.filterBySeats) {
      setFilterBySeats(options.seatsCount);
    } else {
      setFilterBySeats(null);
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg">
      <div className="flex gap-2 items-center justify-center">
        <div ref={geocoderStartContainer} className="w-64" />
        <div ref={geocoderEndContainer} className="w-64" />
        <button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
          title="Calculer l'itinéraire"
        >
          <Search size={20} />
        </button>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-white hover:bg-gray-800 hover:text-white text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center border border-gray-200"
          title="Options"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtres véhicules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filterByAutonomy" 
                checked={options.filterByAutonomy}
                onCheckedChange={() => handleOptionChange('filterByAutonomy')}
              />
              <Label htmlFor="filterByAutonomy">Filtrer par autonomie suffisante</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filterByDoors" 
                checked={options.filterByDoors}
                onCheckedChange={() => handleOptionChange('filterByDoors')}
              />
              <Label htmlFor="filterByDoors">Nombre de portes :</Label>
              <select 
                className="ml-2 border rounded px-2 py-1"
                value={options.doorsCount}
                onChange={(e) => setOptions(prev => ({ ...prev, doorsCount: parseInt(e.target.value) }))}
              >
                <option value={3}>3 portes</option>
                <option value={5}>5 portes</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filterBySeats" 
                checked={options.filterBySeats}
                onCheckedChange={() => handleOptionChange('filterBySeats')}
              />
              <Label htmlFor="filterBySeats">Nombre de places :</Label>
              <select 
                className="ml-2 border rounded px-2 py-1"
                value={options.seatsCount}
                onChange={(e) => setOptions(prev => ({ ...prev, seatsCount: parseInt(e.target.value) }))}
              >
                <option value={2}>2 places</option>
                <option value={4}>4 places</option>
                <option value={5}>5 places</option>
                <option value={7}>7 places</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleValidateFilters}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Appliquer les filtres
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeocoderInputs;
