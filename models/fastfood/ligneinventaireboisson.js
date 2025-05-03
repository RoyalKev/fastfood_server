import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Uniteconversion from './uniteconversion.js';
import Approboisson from './approboisson.js';
import Inventaireboisson from './inventaireboisson.js';

export const Ligneinventaireboisson = sequelize.define('Ligneinventaireboisson', {
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
}, { tableName: 'ligneinventaireboissons' });

Ligneinventaireboisson.belongsTo(Uniteconversion, { foreignKey: 'produit_id' }); // Une ligne appartient à un produit
Uniteconversion.hasMany(Ligneinventaireboisson, { foreignKey: 'produit_id' }); // Un produit peut être dans plusieurs lignes d'appro

Ligneinventaireboisson.belongsTo(Inventaireboisson, { foreignKey: 'inventaire_id' }); // Une ligne appartient à un appro donné
Inventaireboisson.hasMany(Ligneinventaireboisson, { foreignKey: 'inventaire_id' }); // Un appro peut être dans plusieurs lignes d'appro

export default Ligneinventaireboisson;

