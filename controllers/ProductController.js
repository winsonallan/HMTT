const Product = require("../models/Product");

const productModel = new Product();

class ProductController {
  static async index(req, res, next) {
    try {
      const products = await productModel.findAll();
      res.render("products/index", { products, error: null });
    } catch (err) {
      next(err);
    }
  }

  static createForm(req, res) {
    res.render("products/form", { product: null, error: null });
  }

  static async store(req, res, next) {
    try {
      const { name, category, price, stock } = req.body;
      if (!name || !category || price === "" || stock === "") {
        return res.render("products/form", {
          product: req.body,
          error: "All fields are required.",
        });
      }
      await productModel.create({
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      });
      res.redirect("/products");
    } catch (err) {
      next(err);
    }
  }

  static async editForm(req, res, next) {
    try {
      const product = await productModel.findById(req.params.id);
      if (!product) return res.redirect("/products");
      res.render("products/form", { product, error: null });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { name, category, price, stock } = req.body;
      await productModel.update(req.params.id, {
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      });
      res.redirect("/products");
    } catch (err) {
      next(err);
    }
  }

  static async restock(req, res, next) {
    try {
      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        const products = await productModel.findAll();
        return res.render("products/index", {
          products,
          error: "Restock quantity must be a whole number of at least 1.",
        });
      }
      await productModel.restock(req.params.id, quantity);
      res.redirect("/products");
    } catch (err) {
      next(err);
    }
  }

  static async destroy(req, res, next) {
    try {
      await productModel.delete(req.params.id);
      res.redirect("/products");
    } catch (err) {
      if (err.code === "23503") {
        const products = await productModel.findAll();
        return res.render("products/index", {
          products,
          error:
            "Cannot delete product: used in one or more existing order(s).",
        });
      }
      next(err);
    }
  }
}

module.exports = ProductController;
