import { Niveau } from "../models/index.js";

export const getNiveauLibelle = async (libelle) => {
  return await Niveau.findOne({ where: { libelle_niveau: libelle } });
};
