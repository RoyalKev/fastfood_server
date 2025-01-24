import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Unitemesure = sequelize.define('Unitemesure', {
  libelle : { type: DataTypes.STRING, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'Le libellé de lunité de mesure est requis.',
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
}, {tableName: 'unite_mesure'});

export default Unitemesure;

