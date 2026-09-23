const Order = require("../models/Order");
const Product = require("../models/Product");
const OrderValidationError = require("../models/OrderValidationError");

const orderModel = new Order();
const productModel = new Product();

class OrderController {
  static async index(req, res, next) {
    try {
      const orders = await orderModel.findAllWithItems();
      const ordersWithSummary = orders.map((order) => ({
        order,
        summary: orderModel.calculateSummary(order),
      }));
      const report = await orderModel.buildReport();
      res.render("orders/index", { ordersWithSummary, report });
    } catch (err) {
      next(err);
    }
  }

  static async createForm(req, res, next) {
    try {
      const products = await productModel.findAll();
      res.render("orders/form", { products, error: null, old: null });
    } catch (err) {
      next(err);
    }
  }

  static async store(req, res, next) {
    const renderError = async (message, old) => {
      const products = await productModel.findAll();
      return res.render("orders/form", { products, error: message, old });
    };

    try {
      const { customerName, membership, productId, qty } = req.body;

      const productIds = Array.isArray(productId) ? productId : [productId];
      const qtys = Array.isArray(qty) ? qty : [qty];

      const items = [];
      const oldItems = [];
      for (let i = 0; i < productIds.length; i++) {
        if (!productIds[i] || !qtys[i]) continue;
        items.push({ productId: Number(productIds[i]), qty: Number(qtys[i]) });
        oldItems.push({ productId: productIds[i], qty: qtys[i] });
      }
      const old = { customerName, membership, items: oldItems };

      if (!customerName || !items.length) {
        return renderError("Please fill in the order details.", old);
      }

      try {
        await orderModel.createWithItems({
          customerName,
          membership: membership || "Regular",
          items,
        });
      } catch (err) {
        if (err instanceof OrderValidationError) {
          return renderError(err.message, old);
        }
        throw err;
      }

      res.redirect("/orders");
    } catch (err) {
      next(err);
    }
  }

  static async show(req, res, next) {
    try {
      const order = await orderModel.findByIdWithItems(req.params.id);
      if (!order) return res.redirect("/orders");
      const summary = orderModel.calculateSummary(order);
      res.render("orders/show", { order, summary });
    } catch (err) {
      next(err);
    }
  }

  static async destroy(req, res, next) {
    try {
      await orderModel._delete(req.params.id);
      res.redirect("/orders");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
