// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
const upload = multer();
import { Approboisson, Categorie, Inventaireboisson, Ligneapproboisson, Ligneinventaireboisson, Mouvementstock, Produit, Uniteconversion, User } from '../../models/index.js';
import { getCategorieLib } from '../../services/categorieService.js';
import sequelize from '../../config/database.js';
import { Sequelize } from 'sequelize';

const router = express.Router();

router.post('/nouveau', async (req, res) => {
    const { inventaireData, lignes } = req.body;

    if (!inventaireData.userid || !lignes || lignes.length === 0) {
        return res.status(400).json({ success: false, message: "Données invalides" });
    }

    const transaction = await sequelize.transaction();

    try {
        // Création de l'approvisionnement principal
        const newInv = await Inventaireboisson.create({
            userid: inventaireData.userid,
            date: new Date(),
            statut: 'Validé',
        }, { transaction });

        // Ajout des lignes d'approvisionnement
        for (const ligne of lignes) {
            const { produit_id, quantite } = ligne;

            if (!produit_id || !quantite) {
                //throw new Error("Tous les champs de la ligne doivent être renseignés");
                return res.status(400).json({ success: false, message: 'Tous les champs de la ligne doivent être renseignés !' });
            }

            
            // Enregistrement de la ligne d'approvisionnement
            await Ligneinventaireboisson.create({
                inventaire_id: newInv.id,
                produit_id,
                quantite,
                userid: inventaireData.userid
            }, { transaction });

            await Mouvementstock.create({
                date: new Date(),
                produit_id,
                quantite : quantite,
                type_operation: 'Inventaire',
                type_produit:'Boisson',
                userid: inventaireData.userid
            }, { transaction });

            // Mise à jour du stock du produit
            const produit = await Uniteconversion.findByPk(produit_id);
            if (produit) {
                await produit.update({ stock: quantite }, { transaction });
            }
        }

        // Validation de la transaction
        await transaction.commit();
        res.status(201).json({ success: true, message: "Inventaire enregistré avec succès" });

    } catch (error) {
        await transaction.rollback();
        console.error("Erreur d'inventaire :", error);
        res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement" });
    }
});


// Route pour récupérer la liste des categorie
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const { rows: inventaire, count: totalItems } = await Inventaireboisson.findAndCountAll({
            order: [['id', 'DESC']],
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        });
        res.status(200).json({
            Status: true,
            Result: inventaire,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des inventaires :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des inventaires : ${err.message}`,
        });
    }
});

// Route pour récupérer les lignes d'un appro donné
router.get('/lignes/:inventaire_id', async (req, res) => {
    const { inventaire_id } = req.params;

    try {
        if (!inventaire_id) {
            return res.status(400).json({ success: false, message: "ID d'inventaire requis" });
        }

        const lignes = await Ligneinventaireboisson.findAll({
            where: { inventaire_id },
            include: [
                {
                    model: Uniteconversion,
                    attributes: ['designation'], // Récupère seulement le nom du produit
                }
            ]
        });

        if (!lignes.length) {
            return res.status(404).json({ success: false, message: "Aucune ligne trouvée pour cet inventaire" });
        }

        // Formatage de la réponse
        const result = lignes.map(ligne => ({
            id: ligne.id,
            produit_id: ligne.produit_id,
            designation: ligne.Uniteconversion ? ligne.Uniteconversion.designation : "Non défini",
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

//ANNULATION DUN INVENTAIRE appro

router.put('/annuler/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifier si l'inventaire existe
        const inventaire = await Inventaireboisson.findByPk(id, {
            include: {
                model: Ligneinventaireboisson,
                include: {
                    model: Uniteconversion, // Récupère les produits concernés
                }
            }
        });
        if (!inventaire) {
            return res.status(404).json({ success: false, message: "Inventaire non trouvé" });
        }

        // Mettre à jour les stocks des produits
        for (const ligne of inventaire.Ligneinventaires) {
            if (ligne.Uniteconversion) {
                await Uniteconversion.update(
                    { stock: ligne.Uniteconversion.stock - ligne.quantite }, // Annulation = diminution du stock
                    { where: { id: ligne.produit_id } }
                );
                
                /*await Ligneinventaireboisson.update(
                    { statut: 'Annulé' }, 
                    { where: { id: ligne.id } }
                );*/

                await Mouvementstock.create({
                    date: new Date(),
                    produit_id : ligne.produit_id,
                    quantite : ligne.quantite,
                    type_operation: 'Annulation_intaire',
                    type_produit:'Boisson',
                    userid: ligne.userid
                });
            }
        }
        // Supprimer les lignes d'approvisionnement
        //await Ligneappro.destroy({ where: { appro_id: id } });
        // Supprimer l'approvisionnement
        //await Approvisionnement.destroy({ where: { id } });
        await inventaire.update({ statut: "Annulé" });
        res.json({ success: true, message: "Inventaire annulé avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'annulation de l'inventaire :", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

export { router as inventaireboissonRouter }