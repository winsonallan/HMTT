const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

const orderModel = new Order();
const productModel = new Product();

router.get("/", (req, res) => res.redirect("/dashboard"));

router.get("/dashboard", async (req, res, next) => {
  try {
    const report = await orderModel.buildReport();
    const products = await productModel.findAll();
    res.render("dashboard", {
      report,
      productCount: products.length,
      username: req.session.username,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
