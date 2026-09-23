const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { redirectIfAuthed } = require("../middleware/auth");

router.get("/login", redirectIfAuthed, AuthController.showLogin);
router.post("/login", redirectIfAuthed, AuthController.login);
router.post("/logout", AuthController.logout);

module.exports = router;
