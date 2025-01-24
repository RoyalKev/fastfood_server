import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//import { validationResult } from "express-validator"; 

export const register = async (req, res) => {
    // Validate request
   /* const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ Status: false, Errors: errors.array() });
    }*/
  
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  
    try {
      // Check for existing user
      const existingUser = await User.findOne({ where: { email: req.body.email } });
      if (existingUser) {
        return res.status(400).json({ Status: false, Error: "Cette adresse email est déjà lié à un compte utilisateur !" });
      }
  
      // Hash the password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
  
      // Create the user
      const newUser = await User.create({
        nom: req.body.nom,
        email: req.body.email,
        password: hash,
      });
  
      // Generate token
      const token = jwt.sign({ id: newUser.id }, "jwtkey");
  
      // Respond with user data (excluding password)
      const { password, ...userDetails } = newUser.toJSON();
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(userDetails);
    } catch (err) {
      console.error(err);
      res.status(500).json({ Status: false, Error: "Erreur dans l'exécution de la requête" });
    }
  };

//AUTHENTIFICATION UTILISATEUR

export const login = async (req, res) => {
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    try {
      // Check for existing user
      const existingUser = await User.findOne({ where: { email: req.body.email } });
      
      console.log('Utilisateur trouvé :', existingUser);

      if (!existingUser) {
        return res.status(400).json({ Status: false, Error: "Utilisateur non trouvé/ Adresse email inexistant !" });
      }
      console.log(existingUser.password)
      const isPasswordCorrect = bcrypt.compareSync(req.body.password, existingUser.password);
        if (!isPasswordCorrect) return res.status(400).json({ Status: false, Error: "Mot de passe incorrect !" })
            console.log('Mot de passe correct :', isPasswordCorrect);
      // Generate token
      const token = jwt.sign({ id: existingUser.id }, "jwtkey");
      // Respond with user data (excluding password)
      const { password, ...userDetails } = existingUser.toJSON();
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json({ Status: true, ...userDetails });
        console.log(res)
    } catch (err) {
      //console.error(err);
      console.error("Erreur capturée :", err);
      res.status(500).json({ Status: false, Error: "Erreur lors de l'exécution de la requete" + err });
    }
  };

//DECONNEXION
export const logout = (req, res) => {
    try {
      res.clearCookie('token'); // Supprime le cookie contenant le token
      return res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
  };