const config = require('../config');
const mysql = require('mysql2/promise');
const newUser = require('../models/usersModel');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')

const salt = process.env.SALT


module.exports = async function createNewUser(request, response) {
  const connection = await mysql.createConnection(config);

  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  });


  await request.on('end', async () => {
    body = JSON.parse(body);
    body.user_data.password = await bcrypt.hash(body.user_data.password, salt);

    const data = {
      ...body.user,
      ...body.user_data,
      ...body.passport,
      teacher: body.teacher || undefined,
    };

    newUser.constructor(data);
    const res = await newUser.createUser(connection).then();

    response.end(JSON.stringify(res));
  });
}