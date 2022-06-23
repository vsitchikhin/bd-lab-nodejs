const bcrypt = require('bcrypt');
let salt;

async function createSalt() {
  return await bcrypt.genSalt(10);
}

createSalt().then()

module.exports = salt