import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLon(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 10;

    console.log('Recherche de voitures avec les paramètres:', { lat, lng, radius });

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude et longitude requises' }, { status: 400 });
    }

    // Récupérer toutes les voitures disponibles
    const allCars = await prisma.car.findMany({
      where: {
        available: true,
      }
    });

    // Calculer la distance pour chaque voiture et filtrer par rayon
    const carsWithDistance = allCars
      .map(car => ({
        ...car,
        distance: getDistanceFromLatLon(lat, lng, car.lat, car.lng)
      }))
      .filter(car => car.distance <= radius)
      .sort((a, b) => a.distance - b.distance); // Tri par distance croissante

    console.log(`Nombre de voitures trouvées dans un rayon de ${radius}km: ${carsWithDistance.length}`);

    return NextResponse.json(carsWithDistance);
  } catch (error) {
    console.error('Erreur lors de la récupération des voitures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des voitures' },
      { status: 500 }
    );
  }
} 