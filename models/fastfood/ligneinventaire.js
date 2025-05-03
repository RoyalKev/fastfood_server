import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Produit from './produit.js';
import Appro from './appro.js';
import Inventaire from './inventaire.js';

export const Ligneinventaire = sequelize.define('Ligneinventaire', {
    produit_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID du produit doit être un entier valide.',
            },
        },
    },
    categorie_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Champ obligatoire
    },
    inventaire_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID de lappro doit être un entier valide.',
            },
        },
    },
    quantite: {
        type: DataTypes.DOUBLE, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La quantité est requis.',
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
}, { tableName: 'ligneinventaire' });

Ligneinventaire.belongsTo(Produit, { foreignKey: 'produit_id' }); // Une ligne appartient à un produit
Produit.hasMany(Ligneinventaire, { foreignKey: 'produit_id' }); // Un produit peut être dans plusieurs lignes d'appro

Ligneinventaire.belongsTo(Inventaire, { foreignKey: 'inventaire_id' }); // Une ligne appartient à un appro donné
Inventaire.hasMany(Ligneinventaire, { foreignKey: 'inventaire_id' }); // Un appro peut être dans plusieurs lignes d'appro

export default Ligneinventaire;