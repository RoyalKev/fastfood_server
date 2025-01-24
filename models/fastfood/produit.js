import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Produit = sequelize.define('Produit', {
  designation : { type: DataTypes.STRING, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'La désignation du produit est requis.',
      },
    }, 
  },
  prix : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
  categorie_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // Champ obligatoire
    validate: {
      isInt: {
        msg: 'L\'ID de la catégorie doit être un entier valide.',
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
  contenu : { type: DataTypes.DECIMAL, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'Le contenu est requis.',
      },
    }, 
  },
  stock : { type: DataTypes.DOUBLE, allowNull: true, defaultValue:0,},
  seuil : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
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
}, {tableName: 'produits'});


// Méthode pour mettre à jour le stock
Produit.updateStock = async function (produit_id, quantite, transaction) {
  const produit = await Produit.findByPk(produit_id, { transaction });
  if (!produit) throw new Error(`Produit avec l'ID ${produit_id} introuvable.`);

  /*if (produit.stock < quantite) {
    throw new Error(`Stock insuffisant pour le produit ${produit.designation}.`);
  }*/
  produit.stock -= quantite;
  await produit.save({ transaction });
};

export default Produit;

