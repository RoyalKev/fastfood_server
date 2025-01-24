import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

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
    unite_id: {
        type: DataTypes.INTEGER, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Lunité est requis.',
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
    qteligne: {
        type: DataTypes.DOUBLE, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Le montligne est requis.',
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
}, { tableName: 'ligne_vente' });

export default Lignevente;

