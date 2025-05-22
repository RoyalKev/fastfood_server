import express from 'express';
import multer from 'multer';
const upload = multer();
import { Categorie, Composition, Produit, Uniteconversion, User } from '../../models/index.js';
import { getCategorieLib } from '../../services/categorieService.js';
import { getCompo } from '../../services/compositionService.js';

const router = express.Router();


router.post('/nouveau', upload.none(), async (req, res) => {
    const { produit_converti_id, selectedProduitId, quantite, userid } = req.body;
    console.log(req.body)
    try {

      if (!selectedProduitId) {
          return res.status(400).json({ Status: false, message: 'Veuillez sélectionner un produit.' });
        }
        if (!quantite) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la quantité utilisée' });
        }

        const existingCompo = await getCompo(produit_converti_id, selectedProduitId);
        if (existingCompo) {
            return res.status(400).json({ Status: false, message: "Cette ligne a déjà été ajoutée !" });
        }

      const compo = await Composition.create({
        produit_converti_id,
        produit_id : selectedProduitId,
        quantite,
        userid,
      });
  
      res.status(201).json({
        Status: true,
        message: 'Ligne ajoutée avec succès',
        Result: compo,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        Status: false,
        Error: `Erreur lors de l\'ajout du produit : ${err.message}`,
      });
    }
  });

  router.get('/lignes/:id', async (req, res) => {
      const { id } = req.params;
      console.log(id)
  
      try {
          if (!id) {
              return res.status(400).json({ success: false, message: "ID du produit converti requis" });
          }
  
          const lignes = await Composition.findAll({
              where: { produit_converti_id :id },
              include: [
                  {
                      model: Produit,
                      attributes: ['designation'], // Récupère seulement le nom du produit
                  }
              ]
          });
          
          if (!lignes.length) {
                return res.status(200).json({
                    Status: true,
                    Result: [],
                    message: "Aucune ligne trouvée pour cette compo"
                });
            }
  
          // Formatage de la réponse
          const result = lignes.map(ligne => ({
              id: ligne.id,
              produit_id: ligne.produit_id,
              designation: ligne.Produit ? ligne.Produit.designation : "Non défini",
              quantite: ligne.quantite,
          }));
  
          console.log(lignes)
  
          //res.status(200).json({ success: true, data: lignes });
          res.status(200).json({
              Status: true,
              Result: result,
              message: 'lignes récupéré avec succès.',
          });
  
      } catch (error) {
          console.error("Erreur lors de la récupération des lignes :", error);
          res.status(500).json({ success: false, message: "Erreur serveur" });
      }
  });

  // Route pour supprimer une ligne
  router.delete('/supprimer/:id', async (req, res) => {
      const { id } = req.params;
      try {
          // Vérifier si la ligne existe
          const compo = await Composition.findByPk(id);
          if (!compo) {
              return res.status(404).json({
                  Status: false,
                  message: 'compo non trouvée.',
              });
          }
          // Supprimer compo
          await compo.destroy();
          res.status(200).json({
              Status: true,
              message: 'Ligne supprimée avec succès.',
          });
      } catch (err) {
          console.error("Erreur lors de la suppression de la ligne :", err);
          res.status(500).json({
              Status: false,
              Error: `Erreur lors de la suppression de la ligne : ${err.message}`,
          });
      }
  });
  export { router as compositionRouter }