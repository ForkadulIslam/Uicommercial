const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  //
  // host: "127.0.0.1",
  // port: 3306,
  // username: "uicommercial",
  // password: "Uicom@123",
  // database: "uicommercial_db",


  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "",
  database: "uicommercial",
});
module.exports = sequelize;