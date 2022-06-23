

const newUser = {
  name: '',
  surname: '',
  patronymic: '',
  birthDate: '',
  accountType: 0,
  email: '',
  password: '',
  passportNumbers: 0,
  passportOrgan: '',
  issueDate: '',
  subdivisionCode: '',
  teacher: {},

  constructor(data) {
    this.name = data.name;
    this.surname = data.surname;
    this.patronymic = data.patronymic;
    this.birthDate = data.birth_date;
    this.accountType = data.account_type;
    this.email = data.email;
    this.password = data.password;
    this.passportNumbers = data.passport_numbers;
    this.passportOrgan = data.passport_organ;
    this.issueDate = data.issue_date;
    this.subdivisionCode = data.subdivisionCode;
    this.teacher = data.teacher;
  },

  async createUser(connection) {
    let errorMessage = '';
    const isUserExists = await this.checkUserExists(connection);
    const newUserId = await this.getNewUserId(connection);

    if (isUserExists) {
      errorMessage = 'Такой пользователь уже существует!'
      return {
        error: errorMessage.length > 0,
        errorMessage: errorMessage,
        payload: undefined
      };
    }

    await this.insertNewUser(connection, newUserId);
    await this.insertPassport(connection, newUserId);
    await this.insertUserData(connection, newUserId);

    switch (this.accountType) {
      case 1: {
        await this.insertTeacher(connection, this.teacher, newUserId);
        break;
      }
      case 2: {
        await this.insertParent(connection, newUserId);
        break;
      }
      case 3: {
        await this.insertChild(connection, newUserId);
        break;
      }
    }

    return {
      error: errorMessage.length > 0,
      errorMessage: errorMessage,
      payload: undefined
    };
  },

  async checkUserExists(connection) {
    const queryCheckUserExists = `SELECT count(*) AS users_count FROM user_data WHERE email = "${this.email}"`;
    const queryCheckPassportExists = `SELECT count(*) AS passports_count FROM passport WHERE passport_numbers = "${this.passportNumbers}"`;

    const [checkUserRows, checkUserFields] = await connection.execute(queryCheckUserExists);
    const [checkPassportRows, checkPassportFields] = await connection.execute(queryCheckPassportExists);

    return !(checkUserRows[0].users_count === 0 && checkPassportRows[0].passports_count === 0);
  },

  async getNewUserId(connection) {
    const queryGetLastUserId = `SELECT count(*) as users FROM users`;
    const [lastUserIdRow, lastUserIdField] = await connection.execute(queryGetLastUserId);

    return lastUserIdRow[0].users + 1;
  },

  async insertNewUser(connection, id) {
    const queryInsertUser = `INSERT INTO users(user_id, name, surname, patronymic, birth_date)
                VALUES(${id}, "${this.name}", "${this.surname}", "${this.patronymic}", "${this.birthDate}");`;
    const querySetUserAge = `CALL set_user_age(${id});`;

    await connection.execute(queryInsertUser);
    await connection.execute(querySetUserAge);
  },


  async insertPassport(connection, id) {
    const queryInsertPassport = `INSERT INTO passport(user_id, passport_organ, passport_numbers, issue_date, subdivision_code)
            VALUES (${id}, "${this.passportOrgan}", "${this.passportNumbers}", "${this.issueDate}", "${this.subdivisionCode}")`;

    await connection.execute(queryInsertPassport);
  },

  async insertUserData(connection, id) {
    const queryInsertUserData = `INSERT INTO user_data(user_id, account_type, email, password)
                VALUES (${id}, ${this.accountType}, "${this.email}", "${this.password}")`;

    await connection.execute(queryInsertUserData);
  },

  async insertTeacher(connection, teacher, id) {
    const queryInsertTeacher = `INSERT INTO logoped_users(logoped_id, qualification_document_url, institution)
                               VALUES (${id}, "${teacher?.qualification}", "${teacher?.institution}");`;

    await connection.execute(queryInsertTeacher);
  },

  async insertParent(connection, id) {
    const queryInsertParent = `INSERT INTO parent_users(parent_id) VALUES (${id});`;

    await connection.execute(queryInsertParent);
  },

  async insertChild(connection, id) {
    const queryInsertChild = `INSERT INTO child_users(child_id) VALUES (${id});`;

    await connection.execute(queryInsertChild);
  }
}

module.exports = newUser;