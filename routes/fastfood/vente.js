// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
import { Lignevente, Produit, Vente } from '../../models/index.js';
import { getUnitemesureByLib } from '../../services/unitemesureService.js';
import { getCategorieID } from '../../services/produitService.js';
const upload = multer();

const router = express.Router();

router.post('/nouveau', upload.none(), async (req, res) => {
    const { date, statut, montant, userid, lignes } = req.body;

  try {
    // Créer une transaction Sequelize
    const transaction = await Vente.sequelize.transaction();
    let countr = await Vente.count();
                    countr = countr + 1;
        
                let numero = "";
                if (countr < 10) {
                    numero = "000" + countr;
                } else if (countr >= 10 && countr < 100) {
                    numero = "00" + countr;
                } else if (countr >= 100 && countr < 1000) {
                    numero = "0" + countr;
                } else {
                    numero = countr;
                }
    try {
      // Enregistrer la vente
      const newVente = await Vente.create(
        {
          numero,
          date,
          statut,
          montant,
          userid,
        },
        { transaction }
      );

      // Enregistrer les lignes de vente
      for (const ligne of lignes) {
        const unitem = await getUnitemesureByLib(ligne.unite)
        const unite_id = unitem.id;

        const cat = await getCategorieID(ligne.produit_id)
        const categorie_id = cat.categorie_id;
        const designation = cat.designation;
        const quantite_equivalente = cat.quantite_equivalente;
        const produit_mere_id = cat.produit_id;

        let qte = 0;
        if (quantite_equivalente ==0){
            qte = ligne.quantite
        }else{
            qte = quantite_equivalente * ligne.quantite;
        }

        await Lignevente.create(
          {
            categorie_id: categorie_id,
            designation: designation,
            produit_id: ligne.produit_id,
            vente_id: newVente.id,
            prix_unitaire: ligne.prix_unitaire,
            quantite: ligne.quantite,
            unite_id: unite_id,
            unite: ligne.unite,
            montligne: ligne.montligne,
            qteligne: qte,
            userid: ligne.userid,
          },
          { transaction }
        );

        if (produit_mere_id >0 ){
            await Produit.updateStock(produit_mere_id, qte, transaction);
        }
      }

      // Valider la transaction
      await transaction.commit();
      res.status(201).json({ message: "Vente enregistrée avec succès !" });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Une erreur est survenue." });
  }
})


router.get('/derniere_vente/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
      // Récupérer la dernière vente
      const derniereVente = await Vente.findOne({
        where: { userid: userid }, // Filtrer par l'ID utilisateur
        order: [['id', 'DESC']],
      });
  
      if (!derniereVente) {
        return res.status(404).json({ message: "Aucune vente trouvée." });
      }
  
      // Récupérer les lignes associées à cette vente
      const lignes = await Lignevente.findAll({
        where: { vente_id: derniereVente.id },
      });
  
      res.status(200).json({
        vente: derniereVente,
        lignes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la récupération de la dernière vente." });
    }
  });
  


export { router as venteRouter }