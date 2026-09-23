const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");

router.get("/", OrderController.index);
router.get("/new", OrderController.createForm);
router.post("/", OrderController.store);
router.get("/:id", OrderController.show);
router.delete("/:id", OrderController.destroy);

module.exports = router;
