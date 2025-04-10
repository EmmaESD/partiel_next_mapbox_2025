"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useMapContext } from "@/providers/MapContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

interface Car {
  id: number;
  lat: number;
  lng: number;
  brand: string;
  model: string;
  autonomy: number;
  image?: string;
  distance: number;
}

const MapDisplay: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { startCoords, endCoords, routeRequested, setRouteRequested } =
    useMapContext();
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [cars, setCars] = useState<Car[]>([]);

  // Fonction pour créer un élément d'icône personnalisé
  const createCustomMarkerElement = () => {
    const element = document.createElement('div');
    element.className = 'custom-marker';
    element.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="#3b82f6">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
        <path d="M7 9h10v2H7z"/>
      </svg>
    `;
    element.style.width = '40px';
    element.style.height = '40px';
    return element;
  };

  useEffect(() => {
    if (!map && mapContainer.current) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [2.3522, 48.8566],
        zoom: 12,
      });
      mapInstance.on("load", () => {
        setMap(mapInstance);
      });
    }
  }, [map]);

  // Effet pour charger les voitures quand on a les coordonnées de départ
  useEffect(() => {
    const fetchCars = async () => {
      if (startCoords) {
        try {
          const response = await fetch(
            `/api/cars?lat=${startCoords[1]}&lng=${startCoords[0]}&radius=100`
          );
          if (response.ok) {
            const data = await response.json();
            setCars(data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des voitures:', error);
        }
      }
    };

    fetchCars();
  }, [startCoords]);

  // Effet pour afficher les marqueurs des voitures
  useEffect(() => {
    if (map && cars.length > 0) {
      // Supprimer les anciens marqueurs
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Ajouter les nouveaux marqueurs
      cars.forEach(car => {
        const marker = new mapboxgl.Marker({
          element: createCustomMarkerElement()
        })
          .setLngLat([car.lng, car.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0; font-weight: bold;">${car.brand} ${car.model}</h3>
                <p style="margin: 5px 0;"><strong>Autonomie:</strong> ${car.autonomy} km</p>
                <p style="margin: 5px 0;"><strong>Distance:</strong> ${car.distance.toFixed(1)} km</p>
                ${car.image ? `<img src="${car.image}" alt="${car.brand} ${car.model}" style="width: 100%; height: auto; margin-top: 10px;">` : ''}
              </div>
            `)
          )
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [map, cars]);

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
        const distance = route.distance;
        const duration = route.duration;

        const distanceKm = (distance / 1000).toFixed(1);
        const durationMinutes = Math.round(duration / 60);

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
