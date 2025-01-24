// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
const upload = multer();
import { Categorie, Produit, User } from '../../models/index.js';
import { getCategorieLib } from '../../services/categorieService.js';

const router = express.Router();

router.post('/nouveau', upload.none(), async (req, res) => {
    const { libelle, userid } = req.body;
    console.log(req.body)
    try {
        if (!libelle) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le libelle de la catégorie !' });
        }

        const existingCategorie = await getCategorieLib(libelle);
        if (existingCategorie) {
            return res.status(400).json({ Status: false, message: "Cette catégorie existe déjà !" });
        }

        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }


        const cat = await Categorie.create({
            libelle : libelle,
            userid,
        });

        res.status(201).json({ Status: true, message: 'Catégorie créée avec succès !', Result: cat });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});

// Route pour récupérer la liste des categorie
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const { rows: categories, count: totalItems } = await Categorie.findAndCountAll({
            order: [['libelle', 'ASC']],
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        });
        res.status(200).json({
            Status: true,
            Result: categories,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des categories :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des categories : ${err.message}`,
        });
    }
});
// Route pour supprimer un categorie
router.delete('/supprimer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si le categorie existe
        const categorie = await Categorie.findByPk(id);
        if (!categorie) {
            return res.status(404).json({
                Status: false,
                message: 'categorie non trouvée.',
            });
        }

        // Supprimer categorie
        await categorie.destroy();

        res.status(200).json({
            Status: true,
            message: 'categorie supprimée avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de la suppression de la categorie :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la suppression de la categorie : ${err.message}`,
        });
    }
});

// Route pour récupérer les produits d'une categorie donnée
router.get('/produitcat/:id', async (req, res) => {
    const { id } = req.params;
    const { offset = 0, limit = 10, page = 1 } = req.query;

    try {
        let produits, totalItems;

        if (id == 0) {
            ({ rows: produits, count: totalItems } = await Produit.findAndCountAll({
                order: [['libelle', 'ASC']],
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

export { router as categorieRouter }