const bcrypt = require("bcryptjs");
const User = require("../models/User");

const userModel = new User();

class AuthController {
  static showLogin(req, res) {
    res.render("login", { error: null });
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const user = await userModel.findByUsername(username);

      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.render("login", { error: "Invalid username or password." });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect("/dashboard");
    } catch (error) {
      next(error);
    }
  }

  static logout(req, res) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  }
}

module.exports = AuthController;
