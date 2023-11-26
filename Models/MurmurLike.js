const { DataTypes, Model } = require('sequelize');
const sequelize = require('./dbconfig'); // Adjust the import path based on your project structure

class MurmurLike extends Model {}

MurmurLike.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    murmur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MurmurLike',
    tableName: 'murmur_likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = MurmurLike;