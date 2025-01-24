import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Mouvementstock = sequelize.define('Mouvementstock', {
    date: {
        type: DataTypes.DATE, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'LA Date est requis.',
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
        type: DataTypes.DECIMAL, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La quantité est requis.',
            },
        },
    },
    avant: {
        type: DataTypes.DECIMAL, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Avant est requis.',
            },
        },
    },
    apres: {
        type: DataTypes.DECIMAL, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Apres est requis.',
            },
        },
    },
    type_operation: {
        type: DataTypes.STRING, allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Type operation est requis.',
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
}, { tableName: 'mouvement_stock' });

export default Mouvementstock;