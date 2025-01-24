import { Produit, Uniteconversion } from "../models/index.js";

export const getProduit = async (categorie_id, designation) => {
  return await Produit.findOne({ where: { categorie_id : categorie_id, designation : designation } });
};

export const getProduitConversion = async (categorie_id, designation, unite_id) => {
  return await Uniteconversion.findOne({ where: { categorie_id : categorie_id, designation : designation, unite_id:unite_id } });
};

export const getProduitByID = async (produit_id) => {
  return await Produit.findOne({ where: { id: produit_id } });
};
export const getCategorieID = async (produit_id) => {
  return await Uniteconversion.findOne({ where: { id: produit_id } });
};