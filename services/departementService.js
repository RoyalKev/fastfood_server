import { Departement } from "../models/index.js";

export const getDepartementNom = async (nom) => {
  return await Departement.findOne({ where: { nom_departement: nom } });
};
