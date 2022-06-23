const config = require('../config');
const mysql = require('mysql2/promise');
const authorisation = require('../models/sessionsModel');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')

const salt = process.env.SALT


module.exports = async function authorizateUser(request, response) {
  const connection = await mysql.createConnection(config);

  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  })

  await request.on('end', async () => {
    body = JSON.parse(body);
    body.password = await bcrypt.hash(body.password, salt);

    authorisation.constructor(body);
    const res = await authorisation.getUserByEmail(connection);

    response.end(JSON.stringify(res));
  });
}