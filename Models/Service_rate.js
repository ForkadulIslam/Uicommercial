const { Model, DataTypes } = require('sequelize');
const sequelize = require('./dbconfig');

const Service = require('../Models/Service'); // Import the Service model
const Process = require('../Models/Process'); // Import the Process model

const _Model = sequelize.define('Service_rate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
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
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Process is required',
            },
        },
    },
    effective_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Effective date is required',
            },
        },
    },
    process_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Process price is required',
            },
        },
    },
    extended_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Extended price is required',
            },
        },
    },
}, {
    tableName: 'service_rates',
    modelName: 'Service_rate',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Define associations
_Model.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
_Model.belongsTo(Process, { foreignKey: 'process_id', as: 'process' });

module.exports = _Model;