import { Poste } from "../models/index.js";

export const getPoste = async (libelle, categorieid, departementid) => {
  return await Poste.findOne({ where: { libelle_poste: libelle, categorie_employe_id: categorieid, departement_id:  departementid } });
};

export const getPosteByID = async (poste_id) => {
  return await Poste.findOne({ where: { id: poste_id } });
};