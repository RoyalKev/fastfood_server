import { Reunion, Salle } from "../models/index.js";

export const getReunionId = async (id) => {
  return await Reunion.findOne({ where: { id : id } });
};
export const getSalleId = async (salle_id) => {
    return await Salle.findOne({ where: { id : salle_id } });
  };