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

        // Conversion des unités
        const distanceKm = (distance / 1000).toFixed(1);
        const durationMinutes = Math.round(duration / 60);

        // Ajout de la source de l'itinéraire si elle n'existe pas
        if (!map.getSource("route")) {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: data
            }
          });
        } else {
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: data
          });
        }

        // Ajout du style de la ligne si elle n'existe pas
        if (!map.getLayer("route")) {
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4
            }
          });
        }

        // Création du popup avec les détails de l'itinéraire
        const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
          .setLngLat(start)
          .setHTML(`
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #3b82f6;">Détails de l'itinéraire</h3>
              <p style="margin: 5px 0;"><strong>Distance :</strong> ${distanceKm} km</p>
              <p style="margin: 5px 0;"><strong>Durée estimée :</strong> ${durationMinutes} minutes</p>
            </div>
          `)
          .addTo(map);

        // Ajustement automatique du zoom pour voir l'itinéraire complet
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(start);
        bounds.extend(end);
        map.fitBounds(bounds, {
          padding: 100,
          duration: 1000
        });
      };

      getRoute(startCoords, endCoords);
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
