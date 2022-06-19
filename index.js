require('dotenv').config();
const mysql = require('mysql');
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const base = process.env.DATABASE;
const password = process.env.DB_PASSWORD;


// Config
const  connection = mysql.createConnection({
  host: host,
  user: user,
  database: base,
  password: password,
})

// Connect
connection.connect(err => {
  if (err) {
    console.log("The error: " + err + " occurred")
    return err
  } else {
    console.log("Connection success")
  }
})