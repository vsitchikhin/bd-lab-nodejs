const uuid = require('uuid')

const authorizatedUser = {
  email: '',
  password: '',

  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  },

  async getUserByEmail(connection) {
    const queryGetUser = `SELECT * FROM users INNER JOIN user_data using(user_id) WHERE email = "${this.email}"`
    const [userRows, userFields] = await connection.execute(queryGetUser);
    if (userRows.length === 0) {
      return {
        error: true,
        errorMessage: 'Пользователя с таким email не существует!',
        payload: undefined,
      };
    }

    const isValidPassword = this.comparePasswords(userRows[0].password, this.password);

    if (isValidPassword) {
      const session = this.getSession(userRows[0].user_id, connection);
      return {
        error: false,
        errorMessage: '',
        payload: session,
      };
    }
    return {
      error: true,
      errorMessage: 'Неверный пароль!',
      payload: undefined,
    }
  },

  comparePasswords(password, userPassword) {
    return password === userPassword;
  },

  async getSession(id, connection) {
    const session_id = uuid.v4();
    const currentDate = new Date().toISOString().split('T');
    let date = currentDate[0];
    date = date + 14;
    const time = currentDate[1];

    const queryCheckSessionExists = `SELECT count(*) FROM user_sessions WHERE user_id = ${id}`;
    const queryGetSessionByUserId = `SELECT * FROM user_sessions WHERE user_id = ${id}`
    const queryCreateSession = `INSERT INTO user_sessions(session_id, user_id, end_date)
                            VALUES("${session_id}", ${id}, "${date + ' ' + time}")`;

    const checkSessionExists = await connection.execute(queryCheckSessionExists)
    if (checkSessionExists.length > 0) {
      const [sessionRows, sessionFields] = await connection.execute(queryGetSessionByUserId);
      return {
        sessionRows,
      }
    }

    await connection.execute(queryCreateSession);
    const [sessionRows, sessionFields] = await connection.execute(queryGetSessionByUserId);

    return {
      sessionRows,
    }
  }
}

module.exports = authorizatedUser