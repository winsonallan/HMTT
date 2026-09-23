CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  category   VARCHAR(50) NOT NULL CHECK (category IN ('Regular', 'Premium')),
  price      NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
  stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  membership    VARCHAR(20) NOT NULL DEFAULT 'Regular'
                CHECK (membership IN ('Regular', 'Silver', 'Gold')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty        INTEGER NOT NULL CHECK (qty > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
