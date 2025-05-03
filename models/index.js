import sequelize from '../config/database.js';
import User from './user.js';
import Categorie from './fastfood/categorie.js';
import Lignevente from './fastfood/lignevente.js';
import Mouvementstock from './fastfood/mouvementstock.js';
import Produit from './fastfood/produit.js';
import Uniteconversion from './fastfood/uniteconversion.js';
import Vente from './fastfood/vente.js';
import Unitemesure from './fastfood/unitemesure.js';
import Appro from './fastfood/appro.js';
import Ligneappro from './fastfood/ligneappro.js';
import Composition from './fastfood/composition.js';
import Approboisson from './fastfood/approboisson.js';
import Ligneapproboisson from './fastfood/ligneapproboisson.js';
import Inventaire from './fastfood/inventaire.js';
import Ligneinventaire from './fastfood/ligneinventaire.js';
import Inventaireboisson from './fastfood/inventaireboisson.js';
import Ligneinventaireboisson from './fastfood/ligneinventaireboisson.js';
import Table from './fastfood/table.js';


export { User, Produit, Categorie, Lignevente, Mouvementstock, Uniteconversion, Vente, Unitemesure,
    Appro, Ligneappro, Composition, Approboisson, Ligneapproboisson, Inventaire, Ligneinventaire, Inventaireboisson,
    Ligneinventaireboisson, Table,
};

