import { Salle } from "../models/index.js";

export const getSalleNum = async (nom) => {
  return await Salle.findOne({ where: { numero_salle: nom } });
};
export const getSalleId = async (id) => {
  return await Salle.findOne({ where: { id: id } });
};