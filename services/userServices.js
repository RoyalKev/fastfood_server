import { Appro, Approboisson, Categorie, Composition, Inventaire, Inventaireboisson, Produit, Uniteconversion, Vente } from "../models/index.js";
import { User } from "../models/user.js"; // Assuming you have a Sequelize model for users

export const getUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

export const getUserByNom = async (nom, direction_id) => {
  return await User.findOne({ where: { nom: nom, direction_id : direction_id }  });
};


const getUser = (model) => async (userid) => 
  model.findOne({ where: { userid } });

export const getUserByVente  = getUser(Vente);
export const getUserByAppro   = getUser(Appro);
export const getUserByApprob = getUser(Approboisson);
export const getUserByCat    = getUser(Categorie);
export const getUserByComp   = getUser(Composition);
export const getUserByInv   = getUser(Inventaire);
export const getUserByInvb   = getUser(Inventaireboisson);
export const getUserByUnitec   = getUser(Uniteconversion);
export const getUserByPro   = getUser(Produit);