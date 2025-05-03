import { Composition } from "../models/index.js";

export const getCompo = async (produit_converti_id, produit_id) => {
  return await Composition.findOne({ where: { produit_converti_id: produit_converti_id, produit_id: produit_id } });
};