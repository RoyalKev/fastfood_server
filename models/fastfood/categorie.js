import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Categorie = sequelize.define('Categorie', {
  libelle : { type: DataTypes.STRING, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'Le libellé de la catégorie est requis.',
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
}, {tableName: 'categories'});

export default Categorie;

