// middleware/validateProduct.js
import { validationResult } from 'express-validator';

export const validationProduit = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
