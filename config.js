require('dotenv').config();

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const base = process.env.DATABASE;
const password = process.env.DB_PASSWORD;

module.exports = {
  host: host,
  user: user,
  database: base,
  password: password,
}