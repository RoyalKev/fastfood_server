import { Employe } from "../models/index.js";

export const getEmploye = async (nom, prenoms) => {
  return await Employe.findOne({ where: { nom_employe: nom, prenoms_employe: prenoms } });
};
