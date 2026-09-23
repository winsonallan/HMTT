const fs = require("fs");
const path = require("path");

class BaseModel {
  constructor(tableName) {
    if (new.target === BaseModel) {
      throw new Error("BaseModel cannot be instantiated directly");
    }

    this.tableName = tableName;
    this.filePath = path.join(__dirname, "..", "data", `${tableName}.json`);
    this._ensureFile();
  }

  async _findAll(orderBy = "id ASC") {
    const { rows } = await this.pool.query(
      `SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`,
    );
    return rows;
  }

  async _findById(id) {
    const { rows } = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id],
    );
    return rows[0] || null;
  }

  async _create(data) {
    const keys = Object.keys(data);
    const columns = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => data[k]);

    const { rows } = await this.pool.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return rows[0];
  }

  async _update(id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = keys.map((k) => data[k]);
    values.push(id);

    const { rows } = await this.pool.query(
      `UPDATE ${this.tableName} SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return rows[0] || null;
  }

  async _delete(id) {
    const { rowCount } = await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id],
    );
    return rowCount > 0;
  }
}
