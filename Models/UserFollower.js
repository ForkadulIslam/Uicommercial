const { DataTypes, Model } = require("sequelize");
const sequelize = require("./dbconfig");
const User = require('./User');

class UserFollower extends Model {}

UserFollower.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    followed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'UserFollower',
    tableName: 'user_followers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = UserFollower;