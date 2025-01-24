import { Produit } from "../models/produit.js";

export const nouveauProduit = async (req, res) => {
    const { nom, description, image_logo } = req.body;
  
    try {
      const newProduit = await Produit.create({
        nom,
        description,
        image_logo,
      });
  
      res.status(201).json({ message: 'Produit créé avec succès', produit: newProduit });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
  };