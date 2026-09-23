const StringMatcher = require("../models/StringMatcher");

class MatchController {
  static showForm(req, res) {
    res.render("match/index", { result: null, form: {} });
  }

  static compare(req, res) {
    const { input1, input2, mode } = req.body;
    const caseSensitive = mode === "sensitive";
    const result = StringMatcher.compare(input1, input2, caseSensitive);
    res.render("match/index", { result, form: req.body });
  }
}

module.exports = MatchController;
