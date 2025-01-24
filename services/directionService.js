import { Direction } from "../models/index.js";

export const getDirectionNom = async (nom) => {
  return await Direction.findOne({ where: { nom_direction : nom } });
};
