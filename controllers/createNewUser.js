const config = require('../config');
const mysql = require('mysql2/promise');
const newUser = require('../models/usersModel');

module.exports = async function createNewUser(request, response, salt, bcrypt) {
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

    // И эти 2 тоже, но с теми двумя разные
    const pass = await bcrypt.hash('12345', salt)
    const pass2 = await bcrypt.hash('12345', salt)
    console.log(pass, pass2)

    response.end(JSON.stringify(res));
  });
}