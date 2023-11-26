const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // For password hashing
const sequelize = require('./dbconfig');
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'First name is required',
      },
    },
  },
  last_name: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'Last name is required',
      },
    },
  },
  account_type: {
    type: DataTypes.ENUM('Individual', 'Company', 'Business', 'Virtual Assistant'),
    validate: {
      notEmpty: {
        msg: 'Account type is required',
      },
      isIn: {
        args: [['Individual', 'Company', 'Business', 'Virtual Assistant']],
        msg: 'Invalid account type',
      },
    },
  },
  company_name: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'Company name is required',
      },
    },
  },
  mobile_no: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'Mobile number is required',
      },
      isNumeric: {
        msg: 'Mobile number must be numeric',
      },
      len: {
        args: [10, 11],
        msg: 'Mobile number must be 10 or 11 digits',
      },
    },  
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    unique: {
      args: true,
      msg: 'Email is already registered',
    },
    validate: {
      isEmail: true,
      notEmpty:{
        msg:"Email is required"
      }
    }
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    validate: {
      notEmpty: {
        msg: 'Gender is required',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'Password is required',
      },
    },
  },
  image: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'Image is required',
      },
    },
  },
}, 
{
  timestamps: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    },
  },
});

module.exports = User;