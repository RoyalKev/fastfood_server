// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Categorie, Mouvementstock, Produit, Uniteconversion } from '../../models/index.js';
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
    let { categorie_id, categorie, bouteilleMereid, designation, prix, prix_revient, unite, contenance, userid } = req.body;
    try {
        if (!categorie) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner le type  !' });
        }
        if (!designation) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la designation !' });
        }
        if (!categorie_id) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner la catégorie !' });
        }
        if (!prix) {
            return res.status(400).json({ Status: false, message: 'Saisir le prix de vente !' });
        }
        if (!unite) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner l\'unité !' });
        }
        if (unite == "Verre") {
            if (!bouteilleMereid) {
                return res.status(400).json({ Status: false, message: 'Veuillez sélectionner la boisson mère !' });
            }
        }
        if (unite == "Bouteille") {
            if (!contenance) {
                return res.status(400).json({ Status: false, message: 'Veuillez saisir la contenance en verre!' });
            }
        }
        
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }
        if (!req.file) {
            return res.status(400).json({ Status: false, message: 'Veuillez définir l\'image du produit.' });
        }
        

        const existingProduit = await getProduitConversion(categorie, designation, unite);
        if (existingProduit) {
            return res.status(400).json({ Status: false, message: "Ce produit existe déjà !" });
        }

        const produit = await Uniteconversion.create({
            type : categorie,
            categorie_id : categorie_id,
            designation : designation,
            bouteilleMereId : bouteilleMereid,
            prix : prix,
            prix_revient : prix_revient,
            unite : unite,
            contenance : contenance,
            image: req.file.filename,
            userid,
        });

        res.status(201).json({ Status: true, message: 'Produit crée avec succès !', Result: produit });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});

router.put('/modifier/:id', upload.none(), async (req, res) => {
    const { id } = req.params;
    let { categorie_id, categorie, bouteilleMereid, designation, prix, prix_revient, unite, contenance, userid } = req.body;
        console.log(req.body)
    try {
        // Vérifier si le categorie existe
        const produit = await Uniteconversion.findByPk(id);
        if (!produit) {
            return res.status(404).json({
                Status: false,
                message: 'Produit non trouvé.',
            });
        }
        if (!categorie) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner le type  !' });
        }
        if (!designation) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la designation !' });
        }
        if (!categorie_id) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner la catégorie !' });
        }
        if (!prix) {
            return res.status(400).json({ Status: false, message: 'Saisir le prix de vente !' });
        }
        if (!unite) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner l\'unité !' });
        }
        if (unite == "Verre") {
            if (!bouteilleMereid) {
                return res.status(400).json({ Status: false, message: 'Veuillez sélectionner la boisson mère !' });
            }
        }
        if (unite == "Bouteille") {
            if (!contenance) {
                return res.status(400).json({ Status: false, message: 'Veuillez saisir la contenance en verre!' });
            }
        }
        
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }

        produit.type = categorie;
        produit.categorie_id = categorie_id;
        produit.designation = designation;
        produit.bouteilleMereId = bouteilleMereid;
        produit.prix = prix;
        produit.prix_revient = prix_revient;
        produit.unite = unite;
        produit.contenance = contenance;
        produit.userid = userid;

        await produit.save();

        res.status(200).json({
            Status: true,
            message: 'Produit modifié avec succès.',
            Result: produit
        });
    } catch (err) {
        console.error("Erreur lors de la modification du produit :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la modification du produit : ${err.message}`,
        });
    }
});

// Route pour récupérer la liste des produits
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    
    try {
        const results = await sequelize.query(`
            SELECT 
                p.id AS id,
                p.designation AS designation, 
                p.unite AS unite, 
                p.prix AS prix, 
                p.prix_revient AS prix_revient, 
                p.type AS type,
                p.stock AS stock,
                p.categorie_id AS categorie_id,
                c.libelle AS libelle
                FROM unite_conversion AS p
                INNER JOIN categories AS c ON p.categorie_id = c.id
                ORDER BY p.designation ASC
                LIMIT :limit OFFSET :offset
            `, {
            replacements: { limit: parseInt(limit, 10), offset: parseInt(offset, 10) },
            type: sequelize.QueryTypes.SELECT
        });

        // Récupération du nombre total d'éléments
        const [{ total }] = await sequelize.query(`
            SELECT COUNT(*) AS total FROM unite_conversion
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            Status: true,
            Result: results,
            Pagination: {
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            }
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des produits : ${err.message}`,
        });
    }
});
router.get('/liste2', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.id AS id,
                p.designation AS designation, 
                p.unite AS unite, 
                p.prix AS prix, 
                p.prix_revient AS prix_revient, 
                p.type AS type,
                p.categorie_id AS categorie_id,
                c.libelle AS libelle
                FROM unite_conversion AS p
                INNER JOIN categories AS c ON p.categorie_id = c.id
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

        const produit_detail = await Uniteconversion.findByPk(id, {
                include: [
                    {
                    model: Categorie,
                    attributes : ["libelle"],
                    },
                ]
            });

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

//LISTE DES BOISSONS

// Route pour récupérer la liste des categorie
router.get('/listeboissons', async (req, res) => {
    try {
        let produits, totalItems;
            ({ rows: produits, count: totalItems } = await Uniteconversion.findAndCountAll({
                where: { type: "Boisson", unite: "Bouteille" },
                order: [['designation', 'ASC']],
            }));
        res.status(200).json({
            Status: true,
            Result: produits,
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des boissons :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des boissons : ${err.message}`,
        });
    }
});

// Route pour récupérer la liste des categorie
router.get('/listeboissons2', async (req, res) => {
    try {
        let produits, totalItems;
            ({ rows: produits, count: totalItems } = await Uniteconversion.findAndCountAll({
                where: { type: "Boisson" },
                order: [['designation', 'ASC']],
            }));
        res.status(200).json({
            Status: true,
            Result: produits,
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des boissons :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des boissons : ${err.message}`,
        });
    }
});

// Route pour récupérer les mouvements
router.get('/mouvement/:id', async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "ID d'approvisionnement requis" });
        }

        const lignes = await Mouvementstock.findAll({
            where: { produit_id : id, type_produit: 'Boisson' },
        });

        /*if (!lignes.length) {
            return res.status(404).json({ success: false, message: "Aucune ligne trouvée pour cet approvisionnement" });
        }*/

        // Formatage de la réponse
        const result = lignes.map(ligne => ({
            id: ligne.id,
            produit_id: ligne.produit_id,
            quantite: ligne.quantite,
            type_operation: ligne.type_operation,
            date: ligne.date,
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


export { router as uniteconversionRouter }