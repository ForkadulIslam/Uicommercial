const { Model, DataTypes } = require('sequelize');
const sequelize = require('./dbconfig');

const _Model = sequelize.define('Process', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    service_id: {
        type: DataTypes.STRING,
        validate: {
            notEmpty: {
                msg: 'Service is required',
            },
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Name is required',
            },
        },
    },
    domain_link: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Domain link is required',
            },
        },
    },
    default_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Default quantity is required',
            },
        },
    },
    is_active: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Is active is required',
            },
            isIn: {
                args: [['Yes', 'No']],
                msg: 'Is active type is required',
            },
        },
    },
}, {
    tableName: 'processes',
    modelName: 'Process',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = _Model;