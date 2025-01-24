// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
const upload = multer();
import { Unitemesure, User } from '../../models/index.js';
import { getUnitemesureLib } from '../../services/unitemesureService.js';

const router = express.Router();

router.post('/nouveau', upload.none(), async (req, res) => {
    const { libelle, userid } = req.body;
    console.log(req.body)
    try {
        if (!libelle) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le libelle de l\'unité de mesure !' });
        }

        const existingUnite = await getUnitemesureLib(libelle);
        if (existingUnite) {
            return res.status(400).json({ Status: false, message: "Cette unité de mesure existe déjà !" });
        }
        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }


        const unite = await Unitemesure.create({
            libelle : libelle,
            userid,
        });

        res.status(201).json({ Status: true, message: 'Unité de mesure créée avec succès !', Result: unite });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});

// Route pour récupérer la liste des unitemesure
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const { rows: unitemesure, count: totalItems } = await Unitemesure.findAndCountAll({
            order: [['libelle', 'ASC']],
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        });
        res.status(200).json({
            Status: true,
            Result: unitemesure,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des unités de mesure :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des unités de mesure : ${err.message}`,
        });
    }
});
// Route pour supprimer un unitemesure
router.delete('/supprimer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si le unitemesure existe
        const unitemesure = await Unitemesure.findByPk(id);
        if (!unitemesure) {
            return res.status(404).json({
                Status: false,
                message: 'unité de mesure non trouvée.',
            });
        }

        // Supprimer unitemesure
        await unitemesure.destroy();

        res.status(200).json({
            Status: true,
            message: 'unité de mesure supprimée avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de la suppression de l'unité de mesure :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la suppression de l' unité de mesure : ${err.message}`,
        });
    }
});

// Route pour récupérer les utilisateurs d'une unitemesure donnée
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { offset = 0, limit = 10, page = 1 } = req.query;

    try {
        let users, totalItems;

        if (id == 0) {
            ({ rows: users, count: totalItems } = await User.findAndCountAll({
                order: [['libelle', 'ASC']],
                offset: parseInt(offset, 10),
                limit: parseInt(limit, 10),
            }));
        } else if (id > 0) {
            ({ rows: users, count: totalItems } = await User.findAndCountAll({
                where: { unitemesure_id: id }, // Remplace "unitemesureId" par le champ correspondant à la unitemesure dans votre modèle
                order: [['libelle', 'ASC']],
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
            Result: users,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des utilisateurs : ${err.message}`,
        });
    }
});

export { router as unitemesureRouter }