import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Table = sequelize.define('Table', {
  reference : { type: DataTypes.STRING, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'Le numéro de la table est requis.',
      },
    }, 
  },
  emplacement : { type: DataTypes.STRING, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'L\'emplacement de la table est requis.', // Intérieur ou Extérieur
      },
    }, 
  },
   userid: {
    type: DataTypes.INTEGER,
    allowNull: false, // Champ obligatoire
    validate: {
      isInt: {
        msg: 'L\'ID utilisateur doit être un entier valide.',
      },
    },
  },
}, {tableName: 'tables'});

export default Table;

