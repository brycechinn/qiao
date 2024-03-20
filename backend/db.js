const crypto = require('crypto');
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'A11inpreflop!',
  database: 'qiao'
});

connection.on("error", (e) => {
    console.error(e);
});

connection.connect(error => {
  if (error) throw error;
  console.log('MySQL database connected successfully.');
});

/**
 * @param {string} username
 * @param {string} hash
 * @param {string} salt
 * @param {string} email
 */
connection.insertUser = async (username, hash, salt, email) => {
  try {
    var secret = crypto.randomBytes(64).toString('hex');
    connection.query(`INSERT INTO users (username, password, email, salt, secret) VALUES ('${username}', '${hash}', '${email}', '${salt}', '${secret}')`);
  } catch (e) {
    console.error(e);
  }
};

connection.test = () => {
  console.log("test");
}; // lmao

module.exports = connection;