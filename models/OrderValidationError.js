class OrderValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "OrderValidationError";
  }
}

module.exports = OrderValidationError;
