const { Model, DataTypes } = require('sequelize');
const sequelize = require('./dbconfig');



const _Model = sequelize.define('Service_taken_by_user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'User is required',
            },
        },
    },
    service_id: {
        type: DataTypes.INTEGER,
        validate: {
            notEmpty: {
                msg: 'Service is required',
            },
        },
    },
    buyer_id: {
        type: DataTypes.INTEGER,
    },
    process_id: {
        type: DataTypes.INTEGER,
    },
    period_as_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Period is required',
            },
        },
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Rate is required',
            },
        },
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Total rate is required',
            },
        },
    },
}, {
    tableName: 'service_taken_by_users',
    modelName: 'Service_taken_by_user',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});



module.exports = _Model;