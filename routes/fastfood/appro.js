// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
const upload = multer();
import { Appro, Categorie, Ligneappro, Mouvementstock, Produit, User } from '../../models/index.js';
import { getCategorieLib } from '../../services/categorieService.js';
import sequelize from '../../config/database.js';
import { Sequelize } from 'sequelize';

const router = express.Router();

router.post('/nouveau', async (req, res) => {
    const { approData, lignes } = req.body;

    if (!approData.userid || !lignes || lignes.length === 0) {
        return res.status(400).json({ success: false, message: "Données invalides" });
    }

    const transaction = await sequelize.transaction();

    try {
        // Création de l'approvisionnement principal
        const newAppro = await Appro.create({
            userid: approData.userid,
            date: new Date(),
            montant: approData.montant,
            statut: 'Validé',
        }, { transaction });

        // Ajout des lignes d'approvisionnement
        for (const ligne of lignes) {
            const { produit_id, quantite, montant_total, unite } = ligne;

            if (!produit_id || !quantite || !montant_total || !unite) {
                //throw new Error("Tous les champs de la ligne doivent être renseignés");
                return res.status(400).json({ success: false, message: 'Tous les champs de la ligne doivent être renseignés !' });
            }

            // Calcul des valeurs

            const produit = await Produit.findByPk(produit_id);

            let contenance = 0;
                if (produit.puisable_en_portion == "Oui"){
                    contenance = produit.contenance;
                }else{
                    contenance = 1;
                }

            const qteligne = (unite === "Franc") ? montant_total * contenance : quantite * contenance;
            const qte_franc = montant_total;
            const prix_unitaire = quantite > 0 ? (montant_total / quantite) : 0;

            // Enregistrement de la ligne d'approvisionnement
            await Ligneappro.create({
                appro_id: newAppro.id,
                produit_id,
                quantite,
                unite,
                montligne: montant_total,
                qteligne,
                prix_unitaire,
                userid: approData.userid
            }, { transaction });

            await Mouvementstock.create({
                date: new Date(),
                produit_id,
                quantite : qteligne,
                type_operation: 'Entrée',
                type_produit:'PS',
                userid: approData.userid
            }, { transaction });

            // Mise à jour du stock du produit
            
            if (produit) {
                await produit.update({ stock: produit.stock + qteligne, stock_franc: produit.stock_franc + qte_franc }, { transaction });
            }
        }

        // Validation de la transaction
        await transaction.commit();
        res.status(201).json({ success: true, message: "Approvisionnement enregistré avec succès" });

    } catch (error) {
        await transaction.rollback();
        console.error("Erreur d'approvisionnement :", error);
        res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement" });
    }
});


// Route pour récupérer la liste des categorie
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const { rows: appro, count: totalItems } = await Appro.findAndCountAll({
            order: [['id', 'DESC']],
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        });
        res.status(200).json({
            Status: true,
            Result: appro,
            Pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page, 10),
            },
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des appro :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des appro : ${err.message}`,
        });
    }
});

// Route pour récupérer les lignes d'un appro donné
router.get('/lignes/:appro_id', async (req, res) => {
    const { appro_id } = req.params;

    try {
        if (!appro_id) {
            return res.status(400).json({ success: false, message: "ID d'approvisionnement requis" });
        }

        const lignes = await Ligneappro.findAll({
            where: { appro_id },
            include: [
                {
                    model: Produit,
                    attributes: ['designation'], // Récupère seulement le nom du produit
                }
            ]
        });

        if (!lignes.length) {
            return res.status(404).json({ success: false, message: "Aucune ligne trouvée pour cet approvisionnement" });
        }

        // Formatage de la réponse
        const result = lignes.map(ligne => ({
            id: ligne.id,
            produit_id: ligne.produit_id,
            designation: ligne.Produit ? ligne.Produit.designation : "Non défini",
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            montligne: ligne.montligne,
            qteligne: ligne.qteligne,
            unite: ligne.unite
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

//ANNULATION DUN APPRO

router.put('/annuler/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifier si l'approvisionnement existe
        const appro = await Appro.findByPk(id, {
            include: {
                model: Ligneappro,
                include: {
                    model: Produit, // Récupère les produits concernés
                }
            }
        });
        if (!appro) {
            return res.status(404).json({ success: false, message: "Appro non trouvé" });
        }

        // Mettre à jour les stocks des produits
        for (const ligne of appro.Ligneappros) {
            if (ligne.Produit) {

                await Produit.update(
                    { stock: ligne.Produit.stock - ligne.qteligne, stock_franc: ligne.Produit.montligne }, // Annulation = diminution du stock
                    { where: { id: ligne.produit_id } }
                );
                
                await Ligneappro.update(
                    { statut: 'Annulé' }, 
                    { where: { id: ligne.id } }
                );

                await Mouvementstock.create({
                    date: new Date(),
                    produit_id : ligne.produit_id,
                    quantite : ligne.qteligne,
                    type_operation: 'Annulation_appo',
                    type_produit:'PS',
                    userid: ligne.userid
                });

            }
        }
        // Supprimer les lignes d'approvisionnement
        //await Ligneappro.destroy({ where: { appro_id: id } });
        // Supprimer l'approvisionnement
        //await Approvisionnement.destroy({ where: { id } });
        await appro.update({ statut: "Annulé" });
        res.json({ success: true, message: "Approvisionnement annulé avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'annulation de l'approvisionnement :", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

export { router as approRouter }