import { Contrat } from "../models/index.js";

export const getContrat = async (employe_id, etat) => {
  return await Contrat.findOne({ where: { employe_id: employe_id, etat:  etat } });
};
