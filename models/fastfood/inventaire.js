import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Inventaire = sequelize.define('Inventaire', {
  date : { type: DataTypes.DATE, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'La date est requis.',
      },
    }, 
  },
  statut : { type: DataTypes.STRING, allowNull: true, defaultValue:'Validé',},
   userid: {
    type: DataTypes.INTEGER,
    allowNull: false, // Champ obligatoire
    validate: {
      isInt: {
        msg: 'L\'ID utilisateur doit être un entier valide.',
      },
    },
  },
}, {tableName: 'inventaire'});

export default Inventaire;

