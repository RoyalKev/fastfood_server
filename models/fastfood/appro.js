import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Appro = sequelize.define('Appro', {
  numero : { type: DataTypes.STRING, allowNull: true,},
  date : { type: DataTypes.DATE, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'La désignation du produit est requis.',
      },
    }, 
  },
  statut : { type: DataTypes.STRING, allowNull: true, defaultValue:'Validé',},
  montant : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
   userid: {
    type: DataTypes.INTEGER,
    allowNull: false, // Champ obligatoire
    validate: {
      isInt: {
        msg: 'L\'ID utilisateur doit être un entier valide.',
      },
    },
  },
}, {tableName: 'appro'});

export default Appro;

