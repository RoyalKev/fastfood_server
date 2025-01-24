import { Categorie } from "../models/index.js";

export const getCategorieLib = async (libelle) => {
  return await Categorie.findOne({ where: { libelle : libelle } });
};
