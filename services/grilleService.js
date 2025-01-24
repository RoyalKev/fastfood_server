import { GrilleSalariale } from "../models/index.js";

export const getGrille = async (categorieid, niveauid) => {
  return await GrilleSalariale.findOne({ where: { categorie_employe_id: categorieid, niveau_id:  niveauid } });
};

export const getGrilleByID = async (grille_id) => {
  return await GrilleSalariale.findOne({ where: { id: grille_id } });
};
