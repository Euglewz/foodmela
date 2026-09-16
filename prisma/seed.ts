import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FOOD_MELA_MENU } from "../src/lib/food-mela-menu";
import { ANJUM_MENU, ANJUM_CATEGORY_WINDOW } from "../src/lib/anjum-menu";

const prisma = new PrismaClient();

const ALL_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

async function main() {
  console.log("Seeding restaurants...");
  const foodMela = await prisma.restaurant.upsert({
    where: { slug: "food-mela" },
    update: {},
    create: {
      slug: "food-mela",
      name: "Food Mela",
      description: "Bengali rice & fish specialties, organized by day and budget.",
      imageUrl: "/images/food_mela_home_page_img.png",
    },
  });

  const anjum = await prisma.restaurant.upsert({
    where: { slug: "anjum-kabab-ghor" },
    update: {},
    create: {
      slug: "anjum-kabab-ghor",
      name: "Anjum Kabab Ghor",
      description: "Chargrilled kababs, naan & porota, served midday through evening.",
      imageUrl: "/images/anjum_kabab_home_page_img.png",
    },
  });

  console.log("Seeding menu items...");
  await prisma.menuItem.deleteMany({});

  for (const item of FOOD_MELA_MENU) {
    await prisma.menuItem.create({
      data: {
        restaurantId: foodMela.id,
        name: `${item.tier} Thali`,
        description: item.description,
        price: item.price,
        category: item.tier,
        availabilityDays: JSON.stringify([item.day]),
        availabilityStart: null,
        availabilityEnd: null,
        isAvailable: true,
      },
    });
  }

  for (const item of ANJUM_MENU) {
    const window = ANJUM_CATEGORY_WINDOW[item.category];
    await prisma.menuItem.create({
      data: {
        restaurantId: anjum.id,
        name: item.name,
        description: "",
        price: item.price,
        category: item.category,
        availabilityDays: JSON.stringify(ALL_DAYS),
        availabilityStart: String(window.startHour).padStart(2, "0") + ":00",
        availabilityEnd: String(window.endHour).padStart(2, "0") + ":00",
        isAvailable: true,
      },
    });
  }

  console.log("Seeding demo accounts...");

  async function upsertUser(data: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "MANAGER" | "RIDER" | "CUSTOMER";
    phone?: string;
    address?: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        phone: data.phone ?? "01700000000",
        address: data.address ?? "Uttara, Sector 7, Road 1, House 1",
      },
    });
  }

  await upsertUser({
    name: "Site Admin",
    email: "euglewz@example.com",
    password: "11223344",
    role: "ADMIN",
  });

  const manager = await upsertUser({
    name: "Manager Demo",
    email: "manager1@foodmela.demo",
    password: "Manager123",
    role: "MANAGER",
  });
  await prisma.managerRestaurant.upsert({
    where: { userId_restaurantId: { userId: manager.id, restaurantId: foodMela.id } },
    update: {},
    create: { userId: manager.id, restaurantId: foodMela.id },
  });

  await upsertUser({
    name: "Rider Demo",
    email: "rider1@foodmela.demo",
    password: "Rider123",
    role: "RIDER",
  });

  for (let i = 1; i <= 20; i++) {
    const num = String(i).padStart(2, "0");
    await upsertUser({
      name: `Customer ${num}`,
      email: `customer${num}@foodmela.demo`,
      password: "Customer123",
      role: "CUSTOMER",
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
