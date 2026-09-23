const bcrypt = require("bcryptjs");
const pool = require("./config/database");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");

const userModel = new User();
const productModel = new Product();
const orderModel = new Order();

async function seed() {
  // --- Seed admin user ---
  if (!(await userModel.findByUsername("admin"))) {
    await userModel._create({
      username: "admin",
      password_hash: bcrypt.hashSync("admin123", 10),
    });
    console.log("Created user admin / admin123");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  // --- Seed products ---
  const existingProducts = await productModel._findAll();
  let products = existingProducts;
  if (existingProducts.length === 0) {
    const toCreate = [
      {
        name: "Logitech G-Pro Wireless",
        category: "Premium",
        price: 2300000,
        stock: 120,
      },
      {
        name: "Keychron K3V2",
        category: "Premium",
        price: 1650000,
        stock: 40,
      },
      {
        name: "Vention USB Hub",
        category: "Regular",
        price: 150000,
        stock: 80,
      },
      {
        name: 'LG Monitor D39EH 17" OLED',
        category: "Premium",
        price: 3200000,
        stock: 15,
      },
      {
        name: "Laptop Stand UGREEN Black",
        category: "Regular",
        price: 120000,
        stock: 60,
      },
      {
        name: "Audio Technica ATH-M40X",
        category: "Premium",
        price: 1450000,
        stock: 25,
      },
    ];
    products = [];
    for (const p of toCreate) {
      products.push(await productModel._create(p));
    }
    console.log(`Seeded ${products.length} products.`);
  } else {
    console.log("Products already exist, skipping.");
  }

  // --- Seed a couple of sample orders ---
  const existingOrders = await orderModel._findAll();
  if (existingOrders.length === 0) {
    const byName = (name) => products.find((p) => p.name === name);

    await orderModel.createWithItems({
      customerName: "Alvin",
      membership: "Gold",
      items: [
        { productId: byName("Keychron K3V2").id, qty: 12 },
        { productId: byName("Logitech G-Pro Wireless").id, qty: 25 },
      ],
    });

    await orderModel.createWithItems({
      customerName: "Budi",
      membership: "Silver",
      items: [
        { productId: byName('LG Monitor D39EH 17" OLED').id, qty: 5 },
        { productId: byName("Laptop Stand UGREEN Black").id, qty: 8 },
      ],
    });

    await orderModel.createWithItems({
      customerName: "Charles",
      membership: "Regular",
      items: [{ productId: byName("Vention USB Hub").id, qty: 3 }],
    });

    console.log("Seeded 3 sample orders.");
  } else {
    console.log("Orders already exist, skipping.");
  }

  console.log("Seeding complete.");
  await pool.end();
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err.message);
  await pool.end();
  process.exit(1);
});
