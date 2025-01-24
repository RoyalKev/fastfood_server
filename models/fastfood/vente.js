import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Vente = sequelize.define('Vente', {
  numero : { type: DataTypes.STRING, allowNull: true,},
  date : { type: DataTypes.DATE, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'La désignation du produit est requis.',
      },
    }, 
  },
  statut : { type: DataTypes.STRING, allowNull: true, defaultValue:'En cours',},
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
}, {tableName: 'vente'});

export default Vente;

