//const { DataTypes } = require('sequelize');
import { DataTypes } from 'sequelize'
//const sequelize = require('../config/database');
import sequelize from '../config/database.js';

export const User = sequelize.define('User', {
  nom: { type: DataTypes.STRING, allowNull: false},
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'User' },
  direction_id: { type: DataTypes.INTEGER, allowNull: true},
  userid: {
    type: DataTypes.INTEGER,
    allowNull: true, // Champ obligatoire
  },
  resetToken: { type: DataTypes.STRING, allowNull: true },
  resetTokenExpiry: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'users', timestamps: true });

export default User;
