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
      const session = await this.getSession(userRows[0].user_id, connection);
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
    const queryGetSessionByUserId = `SELECT * FROM user_sessions WHERE user_id = ${id}`

    const isSessionExists = await this.checkSessionExists(id, connection);

    if (isSessionExists) {
      const [sessionRows, sessionFields] = await connection.execute(queryGetSessionByUserId);
      return sessionRows
    }

    await this.createSession(id, connection);
    const [sessionRows, sessionFields] = await connection.execute(queryGetSessionByUserId);
    return sessionRows[0]
  },

  async createSession(id, connection) {
    const currentDate = new Date().toISOString().split('T');
    const date = currentDate[0];
    let time = currentDate[1];
    time = time.slice(0, -5)
    const session_id = uuid.v4();
    const queryCreateSession = `INSERT INTO user_sessions(session_id, user_id, end_date)
                            VALUES("${session_id}", ${id}, "${date + ' ' + time}")`;

    await connection.execute(queryCreateSession);
  },

  async checkSessionExists(id, connection) {
    const queryCheckSessionExists = `SELECT count(*) AS sessions FROM user_sessions WHERE user_id = ${id}`;
    const [checkSessionRows, checkSessionFields] = await connection.execute(queryCheckSessionExists);
    return checkSessionRows[0].sessions > 0
  }
}

module.exports = authorizatedUser