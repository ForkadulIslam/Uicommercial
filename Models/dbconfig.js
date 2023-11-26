const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  port: 3306,
  username: "uicommercial",
  password: "Uicom@123",
  database: "uicommercial_db",
});

module.exports = sequelize;