const BaseModel = require("./BaseModel");

function castNumeric(row) {
  if (!row) return row;
  return { ...row, price: parseFloat(row.price) };
}

class Product extends BaseModel {
  constructor() {
    super("products");
  }

  async findAll(orderBy) {
    const rows = await super._findAll(orderBy);
    return rows.map(castNumeric);
  }

  async findById(id) {
    const row = await super._findById(id);
    return castNumeric(row);
  }

  async create(data) {
    const row = await super._create(data);
    return castNumeric(row);
  }

  async update(id, data) {
    const row = await super._update(id, data);
    return castNumeric(row);
  }

  async findByCategory(category) {
    const { rows } = await this.pool.query(
      "SELECT * FROM products WHERE LOWER(category) = LOWER($1)",
      [category],
    );
    return rows.map(castNumeric);
  }

  async restock(id, qty) {
    const { rows } = await this.pool.query(
      "UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [qty, id],
    );
    return castNumeric(rows[0] || null);
  }

  async isInStock(id, qty) {
    const product = await this.findById(id);
    if (!product) return false;
    return product.stock >= Number(qty);
  }
}

module.exports = Product;
