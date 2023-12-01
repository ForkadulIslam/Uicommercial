const { Model, DataTypes } = require('sequelize');
const sequelize = require('./dbconfig');

const _Model = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
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
    caption: {
        type: DataTypes.STRING,
        validate: {
            notEmpty: {
                msg: 'Caption is required',
            },
        },
    },
    service_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'service_type is required',
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
                args: [['Yes', 'No']],
                msg: 'Is active type is required',
            },
        },
    },
    remarks: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'services',
    modelName: 'Service',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = _Model;