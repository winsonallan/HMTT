const BaseModel = require("./BaseModel");
const Product = require("./Product");
const OrderValidationError = require("./OrderValidationError");

class Order extends BaseModel {
  constructor() {
    super("orders");
    this.productModel = new Product();
  }

  async findAllWithItems() {
    const { rows: orders } = await this.pool.query(
      "SELECT * FROM orders ORDER BY id DESC",
    );
    const { rows: items } = await this.pool.query(`
      SELECT oi.order_id, oi.product_id, oi.qty,
             p.name, p.category, p.price
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
    `);

    for (const order of orders) {
      order.items = [];
      for (const item of items) {
        if (item.order_id === order.id) {
          order.items.push({
            productId: item.product_id,
            name: item.name,
            category: item.category,
            price: parseFloat(item.price),
            qty: item.qty,
          });
        }
      }
    }
    return orders;
  }

  async findByIdWithItems(id) {
    const order = await super._findById(id);
    if (!order) return null;

    const { rows } = await this.pool.query(
      `SELECT oi.product_id, oi.qty, p.name, p.category, p.price
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id],
    );
    order.items = rows.map((r) => ({
      productId: r.product_id,
      name: r.name,
      category: r.category,
      price: parseFloat(r.price),
      qty: r.qty,
    }));
    return order;
  }

  async createWithItems({ customerName, membership, items }) {
    if (!items.length) {
      throw new OrderValidationError("Add at least one item to the order.");
    }
    for (const item of items) {
      if (
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.qty) ||
        item.qty < 1
      ) {
        throw new OrderValidationError(
          "Each item needs a product and a whole-number quantity of at least 1.",
        );
      }
    }

    const totals = new Map();
    for (const item of items) {
      totals.set(item.productId, (totals.get(item.productId) || 0) + item.qty);
    }
    const deductions = [...totals.entries()].sort((a, b) => a[0] - b[0]);

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        "INSERT INTO orders (customer_name, membership) VALUES ($1, $2) RETURNING *",
        [customerName, membership],
      );
      const order = rows[0];

      for (const item of items) {
        await client.query(
          "INSERT INTO order_items (order_id, product_id, qty) VALUES ($1, $2, $3)",
          [order.id, item.productId, item.qty],
        );
      }

      for (const [productId, qty] of deductions) {
        const result = await client.query(
          "UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 AND stock >= $1",
          [qty, productId],
        );
        if (result.rowCount === 0) {
          const { rows: found } = await client.query(
            "SELECT name, stock FROM products WHERE id = $1",
            [productId],
          );
          if (!found.length) {
            throw new OrderValidationError(
              "A selected product no longer exists.",
            );
          }
          throw new OrderValidationError(
            `Not enough stock for ${found[0].name}: ${qty} requested, ${found[0].stock} available.`,
          );
        }
      }

      await client.query("COMMIT");
      return order;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // math
  calculateSummary(order) {
    let subtotal = 0;
    let itemDiscountTotal = 0;
    const lines = [];

    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const qty = Number(item.qty);
      const lineSubtotal = item.price * qty;

      let discountRate = 0;
      if (qty >= 20) {
        if (item.category === "Premium") {
          discountRate = 0.15;
        } else {
          discountRate = 0.1;
        }
      } else if (qty >= 10) {
        if (item.category === "Premium") {
          discountRate = 0.08;
        } else {
          discountRate = 0.05;
        }
      } else {
        if (item.category === "Premium") {
          discountRate = 0.02;
        } else {
          discountRate = 0;
        }
      }

      const lineDiscount = lineSubtotal * discountRate;

      subtotal += lineSubtotal;
      itemDiscountTotal += lineDiscount;

      lines.push({
        productId: item.productId,
        name: item.name,
        category: item.category,
        price: item.price,
        qty,
        lineSubtotal,
        discountRate,
        lineDiscount,
        lineTotal: lineSubtotal - lineDiscount,
      });
    }

    let membershipRate = 0;
    if (order.membership === "Gold") {
      membershipRate = 0.05;
    } else if (order.membership === "Silver") {
      membershipRate = 0.02;
    } else {
      membershipRate = 0;
    }

    const afterItemDiscount = subtotal - itemDiscountTotal;
    const membershipDiscount = afterItemDiscount * membershipRate;
    const afterAllDiscounts = afterItemDiscount - membershipDiscount;

    const TAX_RATE = 0.11;
    const tax = afterAllDiscounts * TAX_RATE;
    const grandTotal = afterAllDiscounts + tax;

    return {
      lines,
      subtotal,
      itemDiscountTotal,
      membershipRate,
      membershipDiscount,
      tax,
      grandTotal,
    };
  }

  async buildReport() {
    const orders = await this.findAllWithItems();
    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalItemsSold = 0;
    const categoryTotals = {};

    for (let o = 0; o < orders.length; o++) {
      const summary = this.calculateSummary(orders[o]);
      totalRevenue += summary.grandTotal;
      totalDiscount += summary.itemDiscountTotal + summary.membershipDiscount;

      // nested loop
      for (let i = 0; i < summary.lines.length; i++) {
        const line = summary.lines[i];
        totalItemsSold += line.qty;

        // nested if
        if (!categoryTotals[line.category]) {
          categoryTotals[line.category] = 0;
        }
        categoryTotals[line.category] += line.lineTotal;
      }
    }

    return {
      orderCount: orders.length,
      totalRevenue,
      totalDiscount,
      totalItemsSold,
      categoryTotals,
    };
  }
}

module.exports = Order;
