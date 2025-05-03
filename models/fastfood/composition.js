import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Produit from './produit.js';
import Appro from './appro.js';
import Uniteconversion from './uniteconversion.js';

export const Composition = sequelize.define('Composition', {
    produit_converti_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID du produit doit être un entier valide.',
            },
        },
    },
    produit_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID du produit doit être un entier valide.',
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
}, { tableName: 'composition' });

Composition.belongsTo(Uniteconversion, { foreignKey: 'produit_converti_id' }); // Une ligne appartient à un produit
Uniteconversion.hasMany(Composition, { foreignKey: 'produit_converti_id' }); // Un produit peut être dans plusieurs lignes d'appro

Composition.belongsTo(Produit, { foreignKey: 'produit_id' });
Produit.hasMany(Composition, { foreignKey: 'produit_id' });

export default Composition;