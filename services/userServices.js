import { User } from "../models/user.js"; // Assuming you have a Sequelize model for users

export const getUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

export const getUserByNom = async (nom, direction_id) => {
  return await User.findOne({ where: { nom: nom, direction_id : direction_id }  });
};