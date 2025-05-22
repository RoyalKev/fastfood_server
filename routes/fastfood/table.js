// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
const upload = multer();
import {Table } from '../../models/index.js';

const router = express.Router();

router.post('/nouveau', upload.none(), async (req, res) => {
    const { reference, emplacement, userid } = req.body;
    console.log(req.body)
    try {
        if (!reference) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la référence de la table !' });
        }
        if (!emplacement) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner l\'emplacement de la table !' });
        }

        const existingTable = await Table.findOne({ where: { reference : reference, emplacement : emplacement } });
        if (existingTable) {
            return res.status(400).json({ Status: false, message: "Cette table a déjà été enregistrée !" });
        }
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }

        const table = await Table.create({
            reference : reference,
            emplacement : emplacement,
            userid,
        });
        res.status(201).json({ Status: true, message: 'Table créée avec succès !', Result: table });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});

router.put('/modifier/:id', upload.none(), async (req, res) => {
    const { id } = req.params;
    const { reference, emplacement, userid } = req.body;
    try {
        // Vérifier si le table existe
        const table = await Table.findByPk(id);
        if (!table) {
            return res.status(404).json({
                Status: false,
                message: 'Table non trouvée.',
            });
        }
        if (!reference) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir la référence de la table !' });
        }
        if (!emplacement) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner l\'emplacement de la table !' });
        }
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }

        table.emplacement = emplacement;
        table.reference = reference;
        table.userid = userid;

        await table.save();

        res.status(200).json({
            Status: true,
            message: 'Table modifiée avec succès.',
            Result: table
        });
    } catch (err) {
        console.error("Erreur lors de la modification de la table :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la modification de la table : ${err.message}`,
        });
    }
});

// Route pour récupérer la liste des tables
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const { rows: tables, count: totalItems } = await Table.findAndCountAll({
            order: [['reference', 'ASC']],
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        });
        res.status(200).json({
            Status: true,
            Result: tables,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des tables :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des tables : ${err.message}`,
        });
    }
});
//LISTE COMPLETE DES TABLES
router.get('/liste2', async (req, res) => {
    
    try {
        const { rows: tables, count: totalItems } = await Table.findAndCountAll({
            order: [['reference', 'ASC']],
        });
        res.status(200).json({
            Status: true,
            Result: tables,
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des tables :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des tables : ${err.message}`,
        });
    }
});
// Route pour supprimer une table
router.delete('/supprimer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si la table existe
        const table = await Table.findByPk(id);
        if (!table) {
            return res.status(404).json({
                Status: false,
                message: 'Table non trouvée.',
            });
        }

        // Supprimer table
        await table.destroy();

        res.status(200).json({
            Status: true,
            message: 'Table supprimée avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de la suppression de la table :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la suppression de la table : ${err.message}`,
        });
    }
});

// Route pour récupérer une table donnée
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const table = await Table.findByPk(id);
        if (!table) {
            return res.status(404).json({
                Status: false,
                message: 'Table non trouvée.',
            });
        }

        const table_detail = await Table.findByPk(id);

        res.status(200).json({
            Status: true,
            Result: table_detail,
            message: 'Table récupérée avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de la récupération de la table :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération de le table : ${err.message}`,
        });
    }
});

// Route pour récupérer les produits d'une categorie donnée
/*router.get('/produitcat/:id', async (req, res) => {
    const { id } = req.params;
    const { offset = 0, limit = 10, page = 1 } = req.query;

    try {
        let produits, totalItems;

        if (id == 0) {
            ({ rows: produits, count: totalItems } = await Produit.findAndCountAll({
                order: [['reference', 'ASC']],
                offset: parseInt(offset, 10),
                limit: parseInt(limit, 10),
            }));
        } else if (id > 0) {
            ({ rows: produits, count: totalItems } = await Produit.findAndCountAll({
                where: { categorie_id: id }, // Remplace "categorieId" par le champ correspondant à la categorie dans votre modèle
                order: [['designation', 'ASC']],
                offset: parseInt(offset, 10),
                limit: parseInt(limit, 10),
            }));
        } else {
            return res.status(400).json({
                Status: false,
                Error: "L'ID doit être un entier positif ou égal à 0."
            });
        }

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
*/

export { router as tableRouter }