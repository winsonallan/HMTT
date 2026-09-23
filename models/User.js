const BaseModel = require("./BaseModel");

class User extends BaseModel {
  constructor() {
    super("users");
  }

  async findByUsername(username) {
    const { rows } = await this.pool.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
      [username],
    );

    return rows[0] || null;
  }
}

module.exports = User;
