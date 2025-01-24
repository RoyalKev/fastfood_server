//import { CategorieEmploye } from "../models/index.js";

import { CategorieEmploye } from "../models/index.js";

//import { CategorieEmploye } from "../../rh/models/categorieemploye.js";
//import { CategorieEmploye } from "../models/rh/categorieemploye.js";


/*export const getCategorieByCode = async (code_categorie_employe) => {
    return await CategorieEmploye.findOne({ where: { code_categorie_employe } });
};*/
export const getCategorieByCode = async (code) => {
  return await CategorieEmploye.findOne({ where: { code_categorie_employe: code } });
};
