const express = require("express");
const router = express.Router();
const MatchController = require("../controllers/MatchController");

router.get("/", MatchController.showForm);
router.post("/", MatchController.compare);

module.exports = router;
