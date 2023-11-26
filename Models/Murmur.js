const { DataTypes, Model } = require("sequelize");
const sequelize = require("./dbconfig");

class Murmur extends Model {}

Murmur.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Murmur',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);



module.exports = Murmur;