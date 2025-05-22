import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Unitemesure from './unitemesure.js';

export const Produit = sequelize.define('Produit', { // MODELE POUR STOCKER LES PRODUITS SOURCES 
  designation : { type: DataTypes.STRING, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'La désignation du produit est requis.',
      },
    }, 
  },
  unite : { type: DataTypes.STRING, allowNull: true, //Franc, Bouteille, Unité, //
  },
  puisable_en_portion : { type: DataTypes.STRING, allowNull: true, defaultValue:'Non',},
  contenance : { type: DataTypes.DOUBLE, allowNull: true, defaultValue:1,},
  stock : { type: DataTypes.DOUBLE, allowNull: true, defaultValue:0,},
  stock_franc : { type: DataTypes.DOUBLE, allowNull: true, defaultValue:0,},
  stock_bloquant : { type: DataTypes.STRING, allowNull: true, defaultValue:'Non',},
  seuil : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
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

