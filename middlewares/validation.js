// MIDDLEWARE DE CREATION DE COMPTE
import { body, validationResult, check } from 'express-validator';

export const validateUser = [
  body('nom').isLength({ min: 3 }).withMessage('Votre nom doit dépasser au moins 3 caractères'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

//MIDDLEWARE DE LOGIN

export const validateUserLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/*export const validationBoutique = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};*/

export const validationBoutique = [
  body('profil_Boutique').notEmpty().withMessage('Veuillez sélectionner le type de boutique'),
  body('description_Boutique').notEmpty().withMessage('La description est obligatoire'),
  body('logo_Boutique').optional().isURL().withMessage('L\'URL de l\'image est invalide'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];