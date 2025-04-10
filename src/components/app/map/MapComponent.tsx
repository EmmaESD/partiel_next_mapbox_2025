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
        const data = json.routes[0].geometry;

        if (map.getSource("route")) {
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData(data);
        }
      };

      getRoute(startCoords, endCoords);
      map.flyTo({ center: startCoords, zoom: 13 });

      setRouteRequested(false);
    }
  }, [map, routeRequested, startCoords, endCoords, setRouteRequested]);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default MapDisplay;
