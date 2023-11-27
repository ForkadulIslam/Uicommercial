const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  // host: "localhost",
  // port: 8889,
  // username: "root",
  // password: "root",
  // database: "ui_commercial",
  
  host: "127.0.0.1",
  port: 3306,
  username: "uicommercial",
  password: "Uicom@123",
  database: "uicommercial_db",
});
module.exports = sequelize;