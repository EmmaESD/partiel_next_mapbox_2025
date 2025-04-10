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
    name: "Chevrolet Bolt EV",
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

  for (let i = 0; i < NUM_CARS; i++) {
    const centerLat = 44.840115;
    const centerLng = -0.570681;
    const radiusInKm = 100;

    const randomDistance = radiusInKm * Math.sqrt(Math.random());
    const randomAngle = Math.random() * 2 * Math.PI;

    const latOffset = (randomDistance * Math.cos(randomAngle)) / 111;
    const lngOffset =
      (randomDistance * Math.sin(randomAngle)) /
      (111 * Math.cos((centerLat * Math.PI) / 180));

    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;

    const randomIndex = Math.floor(Math.random() * carsTypes.length);
    const carType = carsTypes[randomIndex];

    const autonomy = Math.floor(randomBetween(50, 300));

    const available = Math.random() < 0.5;

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
      `Voiture créée [id: ${car.id}] - Disponibilité: ${car.available} - Autonomie: ${car.autonomy} km - Position: (${car.lat}, ${car.lng})`
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
