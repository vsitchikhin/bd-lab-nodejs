const config = require('./config');
const mysql = require('mysql2/promise');

module.exports = async function autherisateUser(request, response, email, password) {
  const connection = await mysql.createConnection(config);

  let user = await databaseQuery(email, password, connection)
  user = JSON.stringify(user)
  response.end(user);
}


async function databaseQuery(email, password, connection) {
  let query = `SELECT * FROM users INNER JOIN user_data using(user_id) WHERE email = "${email}"`;

  let [userRows, userFields] = await connection.execute(query);

  if (userRows.length === 0) {
    return 'Пользователя с таким email не существует!';
  }

  if (userRows[0].password === password) {
    return userRows[0];
  } else {
    return 'Неправильно введен пароль';
  }

}


async function comparePasswords(userPassword, enterPassword) {
  return userPassword === enterPassword
}