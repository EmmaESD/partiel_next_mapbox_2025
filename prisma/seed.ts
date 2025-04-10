import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const carsTypes = [
  {
    image:
      "https://www.beev.co/wp-content/uploads/2023/09/21ee09d6-43bd-4fd0-9c18-72a16e127f5f-9qrtqg.png",
    name: "Tesla Model S",
    description:
      "La Tesla Model S est une berline électrique haute performance.",
    autonomy: 300,
    power: 1000,
    seats: 5,
    doors: 4,
    brand: "Tesla",
    model: "Model S",
    year: 2023,
    color: "Red",
  },
  {
    image:
      "https://adhgfzvyfq.cloudimg.io/v7/https://id-cs.com/media/car_images/car_901/Model_3_Pearl_White_Multi-Coat.png?force_format=webp",
    name: "Tesla Model 3",
    description:
      "La Tesla Model 3 est une voiture électrique abordable et efficace.",
    autonomy: 350,
    power: 450,
    seats: 5,
    doors: 4,
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    color: "Blue",
  },
  {
    image:
      "https://static-assets.tesla.com/configurator/compositor?context=design_studio_2?&bkba_opt=1&view=FRONT34&size=600&model=mx&options=$MDLX,$MTX18,$PPSW,$WX00,$APBS,$CC01,$SC05,$CPF2,$ICW00,$ST1Y,$TW01&crop=1400,850,300,130&",
    name: "Tesla Model X",
    description:
      "La Tesla Model X est un SUV électrique de luxe doté de portes en aile de faucon.",
    autonomy: 280,
    power: 900,
    seats: 7,
    doors: 5,
    brand: "Tesla",
    model: "Model X",
    year: 2023,
    color: "White",
  },
  {
    image:
      "https://www.pngplay.com/wp-content/uploads/13/Nissan-Leaf-Transparent-Free-PNG.png",
    name: "Nissan Leaf",
    description:
      "La Nissan Leaf est l'une des voitures électriques les plus populaires au monde.",
    autonomy: 240,
    power: 150,
    seats: 5,
    doors: 4,
    brand: "Nissan",
    model: "Leaf",
    year: 2022,
    color: "Silver",
  },
  {
    image:
      "https://images.dealer.com/ddc/vehicles/2023/Chevrolet/Bolt%20EV/Wagon/perspective/front-left/2023_76.png",
    name: "Chevrolet Bolt",
    description:
      "La Chevrolet Bolt EV offre un excellent compromis entre autonomie et performance.",
    autonomy: 259,
    power: 200,
    seats: 5,
    doors: 4,
    brand: "Chevrolet",
    model: "Bolt EV",
    year: 2022,
    color: "Green",
  },
  {
    image:
      "https://mediaservice.audi.com/media/fast/H4sIAAAAAAAAAFvzloG1tIiBOTrayfuvpGh6-m1zJgaGigIGBgZGoDhTtNOaz-I_2DhCHsCEtzEwF-SlMwJZKUycmbmJ6an6QD4_I3taTmV-aUkxO0grz5ZTSa5PN-zNFfTJ-N5wqflzy4ltSQysQF2M84AEsxCQ4EsDEpyqDGASZN58EGEH4jNZMjMwsFYAGZEMIMDHV1qUU5BYlJirV56ZUpIhqGFAJBBmd3ENcfT0CQYAGizkoekAAAA",
    name: "Audi e-tron",
    description:
      "L'Audi e-tron est un SUV électrique sophistiqué alliant technologie et luxe.",
    autonomy: 222,
    power: 400,
    seats: 5,
    doors: 5,
    brand: "Audi",
    model: "e-tron",
    year: 2022,
    color: "Black",
  },
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function main() {
  await prisma.car.deleteMany();

  const NUM_CARS = 100;

  // Points d'intérêt dans l'agglomération bordelaise
  const bordeauxLocations = [
    // Centre de Bordeaux
    { name: "Place de la Bourse", lat: 44.8405, lng: -0.5699 },
    { name: "Place des Quinconces", lat: 44.8452, lng: -0.5735 },
    { name: "Rue Sainte-Catherine", lat: 44.8383, lng: -0.5733 },
    { name: "Place de la Victoire", lat: 44.8307, lng: -0.5723 },
    { name: "Place Gambetta", lat: 44.8398, lng: -0.5807 },
    { name: "Quai des Chartrons", lat: 44.8515, lng: -0.5692 },
    { name: "Place Pey Berland", lat: 44.8377, lng: -0.5783 },
    { name: "Jardin Public", lat: 44.8485, lng: -0.5795 },
    { name: "Gare Saint-Jean", lat: 44.8262, lng: -0.5563 },

    // Mérignac
    { name: "Aéroport de Mérignac", lat: 44.8283, lng: -0.7151 },
    { name: "Mérignac Centre", lat: 44.8431, lng: -0.6458 },
    { name: "Mérignac Soleil", lat: 44.8367, lng: -0.6631 },
    { name: "Pin Galant", lat: 44.8359, lng: -0.6396 },

    // Bègles
    { name: "Centre de Bègles", lat: 44.8064, lng: -0.5533 },
    { name: "Rives d'Arcins", lat: 44.8019, lng: -0.53 },
    { name: "Terres Neuves", lat: 44.8124, lng: -0.5465 },

    // Pessac
    { name: "Centre de Pessac", lat: 44.8079, lng: -0.6325 },
    { name: "Campus Pessac", lat: 44.7958, lng: -0.6156 },
    { name: "Pessac Alouette", lat: 44.7868, lng: -0.643 },

    // Talence
    { name: "Centre de Talence", lat: 44.8089, lng: -0.5897 },
    { name: "Campus Talence", lat: 44.815, lng: -0.5933 },
    { name: "Peixotto", lat: 44.8107, lng: -0.5924 },

    // Cenon / Rive Droite
    { name: "Centre de Cenon", lat: 44.8487, lng: -0.5306 },
    { name: "Palmer", lat: 44.8541, lng: -0.5253 },
    { name: "Arena Floirac", lat: 44.8365, lng: -0.5266 },

    // Eysines / Bruges
    { name: "Eysines Centre", lat: 44.8867, lng: -0.6423 },
    { name: "Bruges Centre", lat: 44.8741, lng: -0.6145 },
    { name: "Les Aubiers", lat: 44.8682, lng: -0.5819 },

    // Lormont / Carbon-Blanc
    { name: "Lormont Génicart", lat: 44.8684, lng: -0.5261 },
    { name: "Carbon-Blanc Centre", lat: 44.8925, lng: -0.5105 },
  ];

  for (let i = 0; i < NUM_CARS; i++) {
    // Sélectionner un emplacement aléatoire dans la liste
    const locationIndex = Math.floor(Math.random() * bordeauxLocations.length);
    const baseLocation = bordeauxLocations[locationIndex];

    // Ajouter une variation aléatoire pour éparpiller les voitures
    // Variation de ±0.003 (environ ±300 mètres)
    const latVariation = randomBetween(-0.003, 0.003);
    const lngVariation = randomBetween(-0.003, 0.003);

    const lat = baseLocation.lat + latVariation;
    const lng = baseLocation.lng + lngVariation;

    const randomIndex = Math.floor(Math.random() * carsTypes.length);
    const carType = carsTypes[randomIndex];

    const autonomy = Math.floor(randomBetween(50, 300));

    const available = Math.random() < 0.7; // 70% des voitures disponibles

    const car = await prisma.car.create({
      data: {
        available,
        autonomy,
        lat,
        lng,
        image: carType.image,
        name: carType.name,
        description: carType.description,
        power: carType.power,
        seats: carType.seats,
        doors: carType.doors,
        brand: carType.brand,
        model: carType.model,
        year: carType.year,
        color: carType.color,
      },
    });

    console.log(
      `Voiture créée [id: ${car.id}] - Emplacement: ${baseLocation.name} - Disponibilité: ${car.available} - Autonomie: ${car.autonomy} km - Position: (${car.lat}, ${car.lng})`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });