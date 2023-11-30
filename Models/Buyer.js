const {Model, DataTypes} = require('sequelize');
const bcrypt = require('bcrypt'); // For password hashing
const sequelize = require('./dbconfig');
const _Model = sequelize.define('Buyer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: 'Name is required',
                },
            },
        },
        short_code: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: 'Short code is required',
                },
            },
        },

        country: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: 'Country ID required',
                },
            },
        },

        is_active: {
            type: DataTypes.ENUM('Yes', 'No'),
            validate: {
                notEmpty: {
                    msg: 'Is active is required',
                },
                isIn: {
                    args: [['Yes', 'No',]],
                    msg: 'Is active type is required',
                },
            },
        },
    },
    {
        tableName: 'buyers',
        modelName: 'Buyer',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

module.exports = _Model;