// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Produit, Uniteconversion } from '../../models/index.js';
import sequelize from '../../config/database.js';
import { getProduit, getProduitByID, getProduitConversion } from '../../services/produitService.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/Images'); // Dossier où les fichiers seront stockés
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`); // Nom unique pour chaque fichier
    },
  });
  
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non supporté. Seuls les fichiers JPEG, PNG, GIF, PDF, Word et Excel sont acceptés.'));
      }
    },
  });

router.post('/nouveau', upload.single('image'), async (req, res) => {
    let { a_produire, categorie_id, produit_id, designation, prix, unite_id, quantite_equivalente, userid } = req.body;
    try {
        if (!a_produire) {
            return res.status(400).json({ Status: false, message: 'Précisez si le produit dérive d\'une production !' });
        }
        if (a_produire == "Oui") {
            if (!designation) {
                return res.status(400).json({ Status: false, message: 'Veuillez saisir la désignation !' });
            }
        }
        if (a_produire == "Non") {
            if (!produit_id) {
                return res.status(400).json({ Status: false, message: 'Veuillez sélectionner le produit !' });
            }
        }
        
        if (!prix) {
            return res.status(400).json({ Status: false, message: 'Saisir le prix de vente !' });
        }
        if (!unite_id) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner l\'unité !' });
        }
        if (a_produire == "Non") {
            if (!quantite_equivalente) {
                return res.status(400).json({ Status: false, message: 'Veuillez saisir la quantité équivalente !' });
            }
        }
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }
        if (!req.file) {
            return res.status(400).json({ Status: false, message: 'Veuillez définir l\'image du produit.' });
        }
        if (produit_id) {
            const produit = await getProduitByID(produit_id)
            designation = produit.designation;
        }

        const existingProduit = await getProduitConversion(categorie_id, designation, unite_id);
        if (existingProduit) {
            return res.status(400).json({ Status: false, message: "Ce produit existe déjà !" });
        }

        const produit = await Uniteconversion.create({
            a_produire : a_produire,
            categorie_id : categorie_id,
            designation : designation,
            produit_id : produit_id,
            prix : prix,
            unite_id : unite_id,
            quantite_equivalente : quantite_equivalente,
            image: req.file.filename,
            userid,
        });

        res.status(201).json({ Status: true, message: 'Produit crée avec succès !', Result: produit });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});

// Route pour récupérer la liste des produits
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.id AS id,
                p.designation AS designation, 
                p.quantite_equivalente AS quantite_equivalente, 
                p.prix AS prix, 
                c.libelle AS libelle,
                p.categorie_id AS categorie_id,
                u.libelle AS ulibelle
                FROM unite_conversion AS p
                INNER JOIN categories AS c ON p.categorie_id = c.id
                INNER JOIN unite_mesure AS u ON p.unite_id = u.id
                ORDER BY p.designation ASC
            `);

        // Assurez-vous que results est un tableau
        const resultsArray = Array.isArray(results) ? results : (results ? [results] : []);

        console.log(resultsArray);

        res.status(200).json({
            Status: true,
            Result: resultsArray,
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des produits : ${err.message}`,
        });
    }
});
// Route pour supprimer un produit
router.delete('/supprimer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si le produit existe
        const produit = await Uniteconversion.findByPk(id);
        if (!produit) {
            return res.status(404).json({
                Status: false,
                message: 'Produit non trouvée.',
            });
        }

        // Supprimer salle
        await produit.destroy();

        res.status(200).json({
            Status: true,
            message: 'Produit supprimé avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de la suppression du produit :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la suppression du produit : ${err.message}`,
        });
    }
});

// Route pour récupérer un produit
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const produit = await Uniteconversion.findByPk(id);
        if (!produit) {
            return res.status(404).json({
                Status: false,
                message: 'Produit non trouvée.',
            });
        }

        const produit_detail = await Uniteconversion.findByPk(id);

        res.status(200).json({
            Status: true,
            Result: produit_detail,
            message: 'produit récupéré avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération du produit : ${err.message}`,
        });
    }
});


router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    let { status } = req.body;
    try {
        if (!status) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner le statut de traitement !' });
        }
        
        const [updatedRows] = await Produit.update(
          {
            status: status,
          },
          {
            where: {
              id: id,
            },
          }
        );

          res.status(200).json({
            Status: true,
            message: `Tâche mise à jour avec succès !`,
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour :", err);
            res.status(500).json({
            Status: false,
            Error: `Erreur lors de la mise à jour du statut : ${err.message}`,
        });
      }
});


export { router as uniteconversionRouter }