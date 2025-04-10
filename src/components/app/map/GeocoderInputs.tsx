"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useMapContext } from "@/providers/MapContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const GeocoderInputs: React.FC = () => {
  const geocoderStartContainer = useRef<HTMLDivElement>(null);
  const geocoderEndContainer = useRef<HTMLDivElement>(null);
  const { setStartCoords, setEndCoords, triggerRoute, startCoords, endCoords } =
    useMapContext();

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
    }
  }, [setStartCoords, setEndCoords]);
  const handleClick = () => {
    if (!startCoords || !endCoords) {
      alert("Veuillez sélectionner les deux adresses.");
      return;
    }
    triggerRoute();
  };

  return (
    <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-lg">
      <div className="flex gap-2 items-center justify-center">
        <div ref={geocoderStartContainer} className="w-64" />
        <div ref={geocoderEndContainer} className="w-64" />
        <button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Calculer l'itinéraire
        </button>
      </div>
    </div>
  );
};

export default GeocoderInputs;
