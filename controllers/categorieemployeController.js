
import { CategorieEmploye } from "../models/index.js";
import { getCategorieByCode } from "../services/categorieemployeService.js";

export const nouveau = async (req, res) => {
    const { code, libelle, userid } = req.body;
    console.log(req.body)
      try {
        
        /*if (code) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le code de la catégorie !' });
        }else{
            const existingCategorie = await getCategorieByCode(code);
            if (existingCategorie) {
                return res.status(400).json({ Status: false, Error: "Cette catégorie a déjà été enregistrée !" });
            }
        }*/
        if (!libelle) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le libellé de la catégorie !' });
        }

        const salaire = 0
    
        // Création de la boutique
        const cat = await CategorieEmploye.create({
          code,
          libelle,
          salaire,
          userid,
        });
    
        res.status(201).json({
          Status: true,
          message: 'Catégorie créée avec succès !',
          Result: cat,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          Status: false,
          Error: `Erreur lors de la création de la catégorie : ${err.message}`,
        });
      }
  };