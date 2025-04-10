"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useMapContext } from "@/providers/MapContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const MapDisplay: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { startCoords, endCoords, routeRequested, setRouteRequested } =
    useMapContext();
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!map && mapContainer.current) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        center: [2.3522, 48.8566],
        zoom: 12,
      });
      mapInstance.on("load", () => {
        setMap(mapInstance);
      });
    }
  }, [map]);

  useEffect(() => {
    if (map && routeRequested && startCoords && endCoords) {
      const getRoute = async (
        start: [number, number],
        end: [number, number]
      ) => {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const json = await query.json();
        const route = json.routes[0];
        const data = route.geometry;
        const distance = route.distance; // en mètres
        const duration = route.duration; // en secondes

        console.log("Distance (m) :", distance);
        console.log("Durée (s) :", duration);

        if (map.getSource("route")) {
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData(data);
        }
      };

      getRoute(startCoords, endCoords);
      map.flyTo({ center: startCoords, zoom: 13 });
      setRouteRequested(false);
    }
  }, [map, routeRequested, startCoords, endCoords, setRouteRequested]);

  useEffect(() => {
    if (map && startCoords && endCoords) {
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat(startCoords)
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Départ</h3>"))
        .addTo(map);

      new mapboxgl.Marker({ color: "green" })
        .setLngLat(endCoords)
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Arrivée</h3>"))
        .addTo(map);
    }
  }, [map, startCoords, endCoords]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapDisplay;
