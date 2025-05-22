// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Mouvementstock, Produit } from '../../models/index.js';
import sequelize from '../../config/database.js';
import { getProduit } from '../../services/produitService.js';
import { Op, Sequelize } from 'sequelize';

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
    let { designation, unite, seuil, stock_bloquant, puisable_en_portion, contenance, userid } = req.body;
    try {
        if (!designation) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la désignation !' });
        }
        if (!unite) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner l\'unité !' });
        }
        if (!seuil) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le stock minimal d\'alert !' });
        }
        if (!stock_bloquant) {
            return res.status(400).json({ Status: false, message: 'Veuillez préciser si le stock est bloquant !' });
        }
        if (!puisable_en_portion) {
            return res.status(400).json({ Status: false, message: 'Veuillez préciser si le produit est puisable en portion !' });
        }
        if (puisable_en_portion =="Oui") {
            if (!contenance) {
                return res.status(400).json({ Status: false, message: 'Veuillez saisir la contenance en portion !' });
            }
        }
       
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }
        
        const existingProduit = await getProduit(designation);
        if (existingProduit) {
            return res.status(400).json({ Status: false, message: "Ce produit existe déjà !" });
        }

        const produit = await Produit.create({
            designation : designation,
            unite : unite,
            seuil : seuil,
            stock_bloquant: stock_bloquant,
            puisable_en_portion: puisable_en_portion,
            contenance: contenance,
            userid,
        });

        res.status(201).json({ Status: true, message: 'Produit crée avec succès !', Result: produit });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});

//MODIFICATION

router.put('/modifier/:id', upload.none(), async (req, res) => {
    const { id } = req.params;
    const { designation, unite, seuil, stock_bloquant, puisable_en_portion, contenance, userid } = req.body;
    console.log(req.body)
    try { 
        // Validations similaires à la création
        if (!designation) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la désignation !' });
        }
        if (!unite) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner l\'unité !' });
        }
        if (!seuil) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le stock minimal d\'alert !' });
        }
        if (!stock_bloquant) {
            return res.status(400).json({ Status: false, message: 'Veuillez préciser si le stock est bloquant !' });
        }
        if (!puisable_en_portion) {
            return res.status(400).json({ Status: false, message: 'Veuillez préciser si le produit est puisable en portion !' });
        }
        if (puisable_en_portion === "Oui" && !contenance) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la contenance en portion !' });
        }
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }
        
        // Vérification de l'existence du produit
        const produit = await Produit.findByPk(id);
        if (!produit) {
            return res.status(404).json({ Status: false, message: "Produit non trouvé !" });
        }

        // Mise à jour du produit
        produit.designation = designation;
        produit.unite = unite;
        produit.seuil = seuil;
        produit.stock_bloquant = stock_bloquant;
        produit.puisable_en_portion = puisable_en_portion;
        produit.contenance = contenance;
        produit.userid = userid;

        // Mise à jour de l'image si un nouveau fichier est envoyé
        

        await produit.save();

        res.status(200).json({ Status: true, message: 'Produit modifié avec succès !', Result: produit });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});


// Route pour récupérer la liste des produits
/*router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const [results, metadata] = await sequelize.query(`
            SELECT 
                p.id AS id,
                p.designation AS designation, 
                p.seuil AS seuil, 
                p.stock_franc AS stock_franc, 
                p.stock_bloquant AS stock_bloquant, 
                p.puisable_en_portion AS puisable_en_portion, 
                p.contenance AS contenance, 
                p.stock AS stock, 
                p.unite AS unite
                FROM produits AS p
                ORDER BY p.designation ASC
            `);

        // Assurez-vous que results est un tableau
        const resultsArray = Array.isArray(results) ? results : (results ? [results] : []);

        console.log(resultsArray);

        res.status(200).json({
            Status: true,
            Result: resultsArray,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des produits : ${err.message}`,
        });
    }
});*/

// Route pour récupérer la liste des categorie
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const { rows: produits, count: totalItems } = await Produit.findAndCountAll({
            order: [['designation', 'ASC']],
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        });
        res.status(200).json({
            Status: true,
            Result: produits,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des produits : ${err.message}`,
        });
    }
});


// Route pour supprimer une produit
router.delete('/supprimer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si le produit existe
        const produit = await Produit.findByPk(id);
        if (!produit) {
            return res.status(404).json({
                Status: false,
                message: 'produit non trouvée.',
            });
        }

        // Supprimer salle
        await produit.destroy();

        res.status(200).json({
            Status: true,
            message: 'produit supprimé avec succès.',
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
        const produit = await Produit.findByPk(id);
        if (!produit) {
            return res.status(404).json({
                Status: false,
                message: 'produit non trouvée.',
            });
        }

        const produit_detail = await Produit.findByPk(id);

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

// Route pour récupérer les mouvements
router.get('/mouvement/:id', async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "ID d'approvisionnement requis" });
        }

        const lignes = await Mouvementstock.findAll({
            where: { produit_id : id, type_produit: 'PS' },
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
//PAGE AFFICHANT LES PRODUITS AU SEUIL DE LEUR STOCK
router.get('/produits-seuil', async (req, res) => {
    try {
      const Result = await Produit.findAll({
        where: {
          stock: {
            [Op.lte]: Sequelize.col('seuil')
          },
          stock_bloquant : 'Oui'
        }
      });
  
      res.status(200).json(Result);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
    }
  });
//RECUPERATION DU NOMBRE TOTAL DE PRODUITS AU SEUIL DE STOCK
// routes/produit.js
router.get('/produits-seuil-count', async (req, res) => {
    try {
      const count = await Produit.count({
        where: {
          stock: {
            [Op.lte]: Sequelize.col('seuil')
          },
          stock_bloquant : 'Oui'
        }
      });
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors du comptage", error: error.message });
    }
  });
  
  

export { router as produitRouter }