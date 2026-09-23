const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");

router.get("/", ProductController.index);
router.get("/new", ProductController.createForm);
router.post("/", ProductController.store);
router.get("/:id/edit", ProductController.editForm);
router.put("/:id", ProductController.update);
router.post("/:id/restock", ProductController.restock);
router.delete("/:id", ProductController.destroy);

module.exports = router;
