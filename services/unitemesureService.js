import { Unitemesure } from "../models/index.js";

export const getUnitemesureLib = async (libelle) => {
  return await Unitemesure.findOne({ where: { libelle : libelle } });
};

export const getUnitemesureByLib = async (libelle) => {
  return await Unitemesure.findOne({ where: { libelle: libelle } });
};