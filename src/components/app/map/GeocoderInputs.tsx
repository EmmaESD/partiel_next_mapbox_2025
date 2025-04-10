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
        mapboxgl: mapboxgl,
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

    if (geocoderEndContainer.current && mapboxgl.accessToken && mapboxgl) {
      const geocoderEnd = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken as string,
        mapboxgl: mapboxgl,
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
    <div className="flex flex-col gap-2 ">
      <div className="flex gap-2 items-center justify-center">
        <div ref={geocoderStartContainer} className="" />
        <div ref={geocoderEndContainer} />
        <button onClick={handleClick}>Search</button>
      </div>
    </div>
  );
};

export default GeocoderInputs;
