import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Uniteconversion = sequelize.define('Uniteconversion', {
  a_produire : { type: DataTypes.STRING, allowNull: false, //Bouteille, unité, verre, 
    validate: { 
      notEmpty: {
        msg: 'Préciser si le produit est produit.',
      },
    }, 
  },
  designation : { type: DataTypes.STRING, allowNull: false, //Bouteille, unité, verre, 
    validate: { 
      notEmpty: {
        msg: 'Préciser si la désignation.',
      },
    }, 
  },
  categorie_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // Champ obligatoire
    validate: {
      isInt: {
        msg: 'L\'ID de la catégorie doit être un entier valide.',
      },
    },
  },
  produit_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Champ obligatoire
    defaultValue:0,
  },
  prix : { type: DataTypes.DECIMAL, allowNull: false, defaultValue:0,
    validate: { 
      notEmpty: {
        msg: 'Le prix du produit est requis.',
      },
    }, 
  },
  unite_id : { type: DataTypes.INTEGER, allowNull: false, //Bouteille, unité, verre, 
    validate: { 
      notEmpty: {
        msg: 'Lunité du produit est requis.',
      },
    }, 
  },
  quantite_equivalente : { type: DataTypes.DOUBLE, allowNull: true, defaultValue:0,}, // le contenu dune unité represente combien dans le produit sélectionné ex: 1/3 Quantité de l’unité principale équivalente (ex. 1 verre = 0.125 litre).
  image : { type: DataTypes.STRING, allowNull: true,},
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

export default Uniteconversion;

