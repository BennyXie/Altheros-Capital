const pgp = require("pg-promise")();
require("dotenv").config({ path: "./server/.env" });

// connection pool auto handled via pg-promise
const db = pgp({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

module.exports = db;
