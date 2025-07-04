import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Table from './table.js';
import User from '../user.js';

export const Vente = sequelize.define('Vente', {
  type_vente : { type: DataTypes.STRING, allowNull: true,}, //Emporté, VIP, Simple, Table, Gozem,montantlivraison
  nomclient : { type: DataTypes.STRING, allowNull: true},
  table_id : { type: DataTypes.INTEGER, allowNull: true,},
  numero : { type: DataTypes.STRING, allowNull: true,},
  date : { type: DataTypes.DATE, allowNull: false, 
    validate: { 
      notEmpty: {
        msg: 'La désignation du produit est requis.',
      },
    }, 
  },
  statut : { type: DataTypes.STRING, allowNull: true, defaultValue:'En cours',},
  montant : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
  montantlivraison : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
  reduction : { type: DataTypes.DECIMAL, allowNull: true, defaultValue:0,},
   userid: {
    type: DataTypes.INTEGER,
    allowNull: true, // Champ obligatoire
  },
}, {tableName: 'vente'});

Vente.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });
Table.hasMany(Vente, { foreignKey: 'table_id' });

Vente.belongsTo(User, { foreignKey: 'userid', as: 'user' });
User.hasMany(Vente, { foreignKey: 'userid' });


export default Vente;

