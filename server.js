const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const matchRoutes = require("./routes/matchRoutes");

const app = express();

app.set("view_engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "hmtt-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
  }),
);

app.use("/", authRoutes);
app.use("/", requireAuth, indexRoutes);
app.use("/products", requireAuth, productRoutes);
app.use("/orders", requireAuth, orderRoutes);
app.use("/match", requireAuth, matchRoutes);

app.use((req, res) => {
  res.status(404).send("Page not found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HashMicro Node.js test app running on http://localhost:${PORT}`);
});
