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
  doors?: number;
  seats?: number;
}

const MapDisplay: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { 
    startCoords, 
    endCoords, 
    routeRequested, 
    setRouteRequested, 
    setRouteDistance,
    cars,
    setCars,
    filterByAutonomy,
    filterByDoors,
    filterBySeats,
  } = useMapContext();
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [routeDistance, setLocalRouteDistance] = useState<number>(0);
  const [isRouteCalculated, setIsRouteCalculated] = useState<boolean>(false);

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
        setLocalRouteDistance(distance);
        setRouteDistance(distance);

        // Chargement des voitures
        const response = await fetch(
          `/api/cars?lat=${startCoords[1]}&lng=${startCoords[0]}&radius=100`
        );
        if (response.ok) {
          const data = await response.json();
          let filteredCars = data;
          
          // Appliquer les filtres
          if (filterByAutonomy) {
            console.log('Filtrage par autonomie activé. Distance du trajet:', distance);
            filteredCars = filteredCars.filter((car: Car) => {
              const hasEnoughAutonomy = car.autonomy >= distance;
              console.log(`Voiture: ${car.brand} ${car.model}, Autonomie: ${car.autonomy}km, Distance du trajet: ${distance}km, Suffisant: ${hasEnoughAutonomy}`);
              return hasEnoughAutonomy;
            });
          }
          
          if (filterByDoors !== null) {
            filteredCars = filteredCars.filter((car: Car) => car.doors === filterByDoors);
          }
          
          if (filterBySeats !== null) {
            filteredCars = filteredCars.filter((car: Car) => car.seats === filterBySeats);
          }
          
          console.log('Nombre de voitures après filtrage:', filteredCars.length);
          
          // Trier les voitures par autonomie
          filteredCars = filteredCars.sort((a: Car, b: Car) => b.autonomy - a.autonomy);

          setCars(filteredCars);
          setIsRouteCalculated(true);
        }
      } catch (error) {
        console.error('Erreur lors du calcul de la distance ou du chargement des voitures:', error);
      }
    };

    handleRouteAndCars();
  }, [map, startCoords, endCoords, routeRequested, setRouteDistance, setCars, filterByAutonomy, filterByDoors, filterBySeats]);

  // Effet pour gérer le filtrage des voitures existantes
  useEffect(() => {
    if (isRouteCalculated && cars.length > 0) {
      let filteredCars = [...cars];
      
      if (filterByAutonomy) {
        console.log('Re-filtrage des voitures existantes. Distance du trajet:', routeDistance);
        filteredCars = cars.filter(car => {
          const hasEnoughAutonomy = car.autonomy >= routeDistance;
          console.log(`Voiture: ${car.brand} ${car.model}, Autonomie: ${car.autonomy}km, Distance du trajet: ${routeDistance}km, Suffisant: ${hasEnoughAutonomy}`);
          return hasEnoughAutonomy;
        });
      }
      
      if (filterByDoors !== null) {
        filteredCars = filteredCars.filter(car => car.doors === filterByDoors);
      }
      
      if (filterBySeats !== null) {
        filteredCars = filteredCars.filter(car => car.seats === filterBySeats);
      }
      
      console.log('Nombre de voitures après re-filtrage:', filteredCars.length);

      setCars(filteredCars);
    }
  }, [filterByAutonomy, filterByDoors, filterBySeats, isRouteCalculated, cars, routeDistance, setCars]);

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
        console.log(popup);

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

  // const handleClick = () => {
  //   if (!startCoords || !endCoords) {
  //     alert("Veuillez sélectionner les deux adresses.");
  //     return;
  //   }
  //   setRouteRequested(false); 
  //   triggerRoute();
  // };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapDisplay;
