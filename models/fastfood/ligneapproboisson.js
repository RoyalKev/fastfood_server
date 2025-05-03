import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Uniteconversion from './uniteconversion.js';
import Approboisson from './approboisson.js';

export const Ligneapproboisson = sequelize.define('Ligneapproboisson', {
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
    appro_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Champ obligatoire
        validate: {
            isInt: {
                msg: 'L\'ID de lappro doit être un entier valide.',
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
    qteligne: {// ici cest la quantite totale ki va rentrer en stock
        type: DataTypes.DOUBLE, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le montligne est requis.',
            },
        },
    },
    statut: {
        type: DataTypes.STRING,
        allowNull: true, // Champ obligatoire
        defaultValue: 'Validé',
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
}, { tableName: 'ligneapproboissons' });

Ligneapproboisson.belongsTo(Uniteconversion, { foreignKey: 'produit_id' }); // Une ligne appartient à un produit
Uniteconversion.hasMany(Ligneapproboisson, { foreignKey: 'produit_id' }); // Un produit peut être dans plusieurs lignes d'appro

Ligneapproboisson.belongsTo(Approboisson, { foreignKey: 'appro_id' }); // Une ligne appartient à un appro donné
Approboisson.hasMany(Ligneapproboisson, { foreignKey: 'appro_id' }); // Un appro peut être dans plusieurs lignes d'appro

export default Ligneapproboisson;

