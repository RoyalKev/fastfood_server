import { Participant } from "../models/index.js";

export const getParticipant = async (reunion_id, userId) => {
  return await Participant.findOne({ where: { reunion_id: reunion_id, userid : userId }  });
};