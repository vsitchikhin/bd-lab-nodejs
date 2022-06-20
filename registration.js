const config = require('./config');
const mysql = require('mysql2/promise');


module.exports = async function createNewUser(request, response) {

  const connection = await mysql.createConnection(config);

  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  });
  request.on('end', () => {
    body = JSON.parse(body);
    let user = body.user;
    let userData = body.user_data;
    let passport = body.passport;
    let logopedUser = body.logoped_data;
    databaseQuery(user, userData, passport, logopedUser, connection);
  });

  // console.log(body, user, userData, passport, logopedUser)
  response.end('ok')
  // return request.on('end', queryRows);
}


async function databaseQuery(user, data, passport, teacher, connection) {
  const isUserExists = await checkUserExists(data, passport, connection);
  let newUserId = await getNewUserId(connection);
  newUserId = newUserId[0].users + 1;

  if (!isUserExists) {
    return console.log('Пользователь с таким email или паспортными данными уже существует!')
  } else {
    await createUser(user, connection, newUserId);
    await insertUserData(data, passport, connection, newUserId);
    await  insertUserRole(data, teacher, connection, newUserId);
  }
}


async function checkUserExists(data, passport, connection) {
  let queryCheckUserExists = `SELECT count(*) as users_count FROM user_data WHERE email = "${data.email}"`;
  let queryCheckUserPassportExists = `SELECT count(*) as passports_count FROM passport 
                WHERE passport_numbers = "${passport.passport_numbers}"`;

  const [checkUser, userFields] = await connection.execute(queryCheckUserExists);
  const [checkPassport, passportFields] = await connection.execute(queryCheckUserPassportExists);
  return checkUser[0].users_count === 0 && checkPassport[0].passports_count === 0;
}


async function createUser(user, connection, userId) {
  let queryCreateNewUser = `INSERT INTO users(user_id, name, surname, patronymic, birth_date)
               VALUES(${userId},"${user.name}", "${user.surname}", "${user.patronymic}", "${user.birth_date}");`;

  await connection.execute(queryCreateNewUser);
}


async function getNewUserId(connection) {
  let queryGetNewUserId = `SELECT count(*) as users FROM users;`;
  const [newUserId, userFields] = await connection.execute(queryGetNewUserId);

  return newUserId;
}


async function insertUserData(data, passport, connection, newUserId) {
  let queryInsertNewUserData = `INSERT INTO user_data(user_id, account_type, email, password) VALUES (${newUserId}, ${Number(data.account_type)}, "${data.email}", "${data.password}");`
  let queryInsertNewUserPassport = `INSERT INTO passport(user_id, passport_organ, passport_numbers, issue_date, subdivision_code) VALUES (${newUserId}, "${passport.passport_organ}", "${passport.passport_numbers}", "${passport.issue_date}", "${passport.subdivision_code}")`;
  await connection.execute(queryInsertNewUserData);
  await connection.execute(queryInsertNewUserPassport);
}


async function insertUserRole(data, teacher, connection, newUserId) {
  teacher = teacher === undefined ? {} : teacher;

  teacher.qualification = teacher?.qualification === undefined ? null : teacher.qualification;
  teacher.institution = teacher?.institution === undefined ? null : teacher.institution;
  let queryInsertNewTeacher = `INSERT INTO logoped_users(logoped_id, qualification_document_url, institution)
                               VALUES (${newUserId}, "${teacher?.qualification}", "${teacher?.institution}");`;
  let queryInsertNewChild = `INSERT INTO child_users(child_id)
                               VALUES (${newUserId});`;
  let queryInsertNewParent = `INSERT INTO parent_users(parent_id)
                               VALUES (${newUserId});`;

  switch (data.account_type) {
    case '1': {
      await connection.execute(queryInsertNewTeacher);
      break;
    }
    case '2': {
      await connection.execute(queryInsertNewParent);
      break;
    }
    case '3': {
      await connection.execute(queryInsertNewChild);
      break;
    }
    default: {
      return "Необходимо выбрать тип аккаунта!"
    }
  }
}