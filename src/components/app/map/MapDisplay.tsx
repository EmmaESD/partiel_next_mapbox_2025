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
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [isRouteCalculated, setIsRouteCalculated] = useState<boolean>(false);
  const [sortByAutonomy, setSortByAutonomy] = useState<boolean>(false);

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

  // Effet pour initialiser la carte
  useEffect(() => {
    if (!map && mapContainer.current) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [2.3522, 48.8566],
        zoom: 12,
      });
      mapInstance.on("load", () => {
        setMap(mapInstance);
      });
    }
  }, [map]);

  // Effet principal pour gérer le calcul de l'itinéraire et l'affichage des voitures
  useEffect(() => {
    const handleRouteAndCars = async () => {
      if (!map || !startCoords || !endCoords || !routeRequested) {
        // Réinitialiser l'état si les conditions ne sont pas remplies
        setCars([]);
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        setIsRouteCalculated(false);
        return;
      }

      try {
        // Calcul de la distance
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const json = await query.json();
        const distance = json.routes[0].distance / 1000;
        setRouteDistance(distance);

        // Chargement et filtrage des voitures
        const response = await fetch(
          `/api/cars?lat=${startCoords[1]}&lng=${startCoords[0]}&radius=100`
        );
        if (response.ok) {
          const data = await response.json();
          const filteredCars = data
            .filter((car: Car) => car.autonomy >= distance)
            .sort((a: Car, b: Car) => b.autonomy - a.autonomy);

          // Supprimer les anciens marqueurs
          markersRef.current.forEach(marker => marker.remove());
          markersRef.current = [];

          // Ajouter les nouveaux marqueurs
          filteredCars.forEach((car: Car) => {
            const marker = new mapboxgl.Marker({
              element: createCustomMarkerElement()
            })
              .setLngLat([car.lng, car.lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(`
                  <div style="padding: 10px;">
                    <h3 style="margin: 0 0 10px 0; font-weight: bold;">${car.brand} ${car.model}</h3>
                    <p style="margin: 5px 0;"><strong>Autonomie:</strong> ${car.autonomy} km</p>
                    <p style="margin: 5px 0;"><strong>Distance du trajet:</strong> ${distance.toFixed(1)} km</p>
                    <p style="margin: 5px 0;"><strong>Distance jusqu'à la voiture:</strong> ${car.distance.toFixed(1)} km</p>
                    ${car.image ? `<img src="${car.image}" alt="${car.brand} ${car.model}" style="width: 100%; height: auto; margin-top: 10px;">` : ''}
                  </div>
                `)
              )
              .addTo(map);

            markersRef.current.push(marker);
          });

          setCars(filteredCars);
          setIsRouteCalculated(true);
        }
      } catch (error) {
        console.error('Erreur lors du calcul de la distance ou du chargement des voitures:', error);
      }
    };

    handleRouteAndCars();
  }, [map, startCoords, endCoords, routeRequested]);

  // Effet pour gérer l'affichage de l'itinéraire
  useEffect(() => {
    if (map && isRouteCalculated && startCoords && endCoords) {
      const getRoute = async () => {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
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
          .setLngLat(startCoords)
          .setHTML(`
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #3b82f6;">Détails de l'itinéraire</h3>
              <p style="margin: 5px 0;"><strong>Distance :</strong> ${distanceKm} km</p>
              <p style="margin: 5px 0;"><strong>Durée estimée :</strong> ${durationMinutes} minutes</p>
            </div>
          `)
          .addTo(map);

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(startCoords);
        bounds.extend(endCoords);
        map.fitBounds(bounds, {
          padding: 100,
          duration: 1000
        });

        setRouteRequested(false);
      };

      getRoute();
    }
  }, [map, isRouteCalculated, startCoords, endCoords, setRouteRequested]);

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

  // Fonction pour trier les voitures par autonomie
  const sortCarsByAutonomy = () => {
    setSortByAutonomy(!sortByAutonomy);
    const sortedCars = [...cars].sort((a, b) => {
      return sortByAutonomy ? a.autonomy - b.autonomy : b.autonomy - a.autonomy;
    });
    setCars(sortedCars);

    // Mettre à jour les marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    sortedCars.forEach((car: Car) => {
      if (map) {
        const marker = new mapboxgl.Marker({
          element: createCustomMarkerElement()
        })
          .setLngLat([car.lng, car.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0; font-weight: bold;">${car.brand} ${car.model}</h3>
                <p style="margin: 5px 0;"><strong>Autonomie:</strong> ${car.autonomy} km</p>
                <p style="margin: 5px 0;"><strong>Distance du trajet:</strong> ${routeDistance.toFixed(1)} km</p>
                <p style="margin: 5px 0;"><strong>Distance jusqu'à la voiture:</strong> ${car.distance.toFixed(1)} km</p>
                ${car.image ? `<img src="${car.image}" alt="${car.brand} ${car.model}" style="width: 100%; height: auto; margin-top: 10px;">` : ''}
              </div>
            `)
          )
          .addTo(map);

        markersRef.current.push(marker);
      }
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {cars.length > 0 && (
        <button
          onClick={sortCarsByAutonomy}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 1000,
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {sortByAutonomy ? 'Trier par autonomie décroissante' : 'Trier par autonomie croissante'}
        </button>
      )}
    </div>
  );
};

export default MapDisplay;
