import { Produit, Uniteconversion } from "../models/index.js";

export const getProduit = async (designation) => {
  return await Produit.findOne({ where: { designation : designation } });
};

export const getProduitConversion = async (categorie, designation, unite) => {
  return await Uniteconversion.findOne({ where: { type : categorie, designation : designation, unite:unite } });
};

export const getProduitByID = async (produit_id) => {
  return await Produit.findOne({ where: { id: produit_id } });
};
export const getCategorieID = async (produit_id) => {
  return await Uniteconversion.findOne({ where: { id: produit_id } });
};