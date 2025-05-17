import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Uniteconversion from './uniteconversion.js';
import Vente from './vente.js';

export const Lignevente = sequelize.define('Lignevente', {
    produit_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID du produit doit être un entier valide.',
            },
        },
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true, // Champ obligatoire
    },
    categorie_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID de la categorie doit être un entier valide.',
            },
        },
    },
    vente_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID de la vente doit être un entier valide.',
            },
        },
    },
    prix_unitaire: {
        type: DataTypes.DOUBLE, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le prix unitaire est requis.',
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
    unite: {
        type: DataTypes.STRING,
        allowNull: true, // Champ obligatoire
    },
    montligne: {
        type: DataTypes.DOUBLE, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le montligne est requis.',
            },
        },
    },
    benef: { type: DataTypes.DOUBLE, allowNull: true, defaultValue:0},
    qteligne: {
        type: DataTypes.DOUBLE, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le montligne est requis.',
            },
        },
    },
    statut: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'En cours',
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
}, { tableName: 'ligne_vente' });

Lignevente.belongsTo(Uniteconversion, { foreignKey: 'produit_id', as: 'produit' }); // Une ligne appartient à un produit
Uniteconversion.hasMany(Lignevente, { foreignKey: 'produit_id' }); // Un produit peut être dans plusieurs lignes de vente

Lignevente.belongsTo(Vente, { foreignKey: 'vente_id', as: 'vente' }); // Une ligne appartient à une vente donnée
Vente.hasMany(Lignevente, { foreignKey: 'vente_id', as: 'lignevente' }); // Un appro peut être dans plusieurs lignes de vente

export default Lignevente;

