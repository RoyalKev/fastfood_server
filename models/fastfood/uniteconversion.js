import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Categorie from './categorie.js';

export const Uniteconversion = sequelize.define('Uniteconversion', {
  designation : { type: DataTypes.STRING, allowNull: false, //Bouteille, unité, verre, 
    validate: { 
      notEmpty: {
        msg: 'Préciser si la désignation.',
      },
    }, 
  },
  type: { 
    type: DataTypes.ENUM("Plat", "Boisson"), 
    allowNull: false 
  },
  categorie_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  unite: { 
    type: DataTypes.STRING, allowNull: false,  //"Bouteille", "Verre", "Unité"
  },
  contenance: { type: DataTypes.FLOAT, allowNull: true }, // en ml si applicable
  bouteilleMereId: { type: DataTypes.INTEGER, allowNull: true }, // Référence à une bouteille si c'est un verre
  /*categorie_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // Champ obligatoire
    validate: {
      isInt: {
        msg: 'L\'ID de la catégorie doit être un entier valide.',
      },
    },
  },*/
  prix : { type: DataTypes.DECIMAL, allowNull: false, defaultValue:0,
    validate: { 
      notEmpty: {
        msg: 'Le prix du produit est requis.',
      },
    }, 
  },
  prix_revient : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
  image : { type: DataTypes.STRING, allowNull: true,},
  stock : { type: DataTypes.DOUBLE, allowNull: true, defaultValue:0,},
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false, // Champ obligatoire
    validate: {
      isInt: {
        msg: 'L\'ID utilisateur doit être un entier valide.',
      },
    },
  },
}, {tableName: 'unite_conversion'});

Uniteconversion.belongsTo(Categorie, { foreignKey: 'categorie_id' });
Categorie.hasMany(Uniteconversion, { foreignKey: 'categorie_id' });

export default Uniteconversion;

