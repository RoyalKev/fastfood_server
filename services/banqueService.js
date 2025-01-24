import { Banque } from "../models/rh/banque.js";

export const getBanqueNom = async (nom) => {
  return await Banque.findOne({ where: { nom_banque: nom } });
};
