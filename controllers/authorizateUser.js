const config = require('../config');
const mysql = require('mysql2/promise');
const authorisation = require('../models/sessionsModel');

module.exports = async function authorizateUser(request, response, salt, bcrypt) {
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

    // Эти 2 одинаковые
    const pass = await bcrypt.hash('12345', salt)
    const pass2 = await bcrypt.hash('12345', salt)
    console.log(pass, pass2)

    response.end(JSON.stringify(res));
  });
}