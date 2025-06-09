/*const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');
const { validateUser } = require('../middlewares/validation');

router.post('/register', validateUser, register);

module.exports = router;*/
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from 'multer';
const upload = multer();
import sequelize from '../config/database.js';
import express from 'express';
import { register, logout, login } from '../controllers/authController.js';
import { validateUser, validateUserLogin } from '../middlewares/validation.js';
import { getUserByAppro, getUserByApprob, getUserByCat, getUserByComp, getUserByEmail, getUserByInv, getUserByInvb, getUserByNom, getUserByPro, getUserByUnitec, getUserByVente } from '../services/userServices.js';
import User from '../models/user.js';
import { Sequelize } from "sequelize";

const router = express.Router();

router.post('/register', validateUser, register);
router.post('/login', validateUserLogin, login);
router.post('/logout', logout);

router.post('/nouveau', upload.none(), async (req, res) => {
    const { nom, email, password, role, userid } = req.body;
    console.log(req.body)
    try {
        if (!nom) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le nom de l\'utilisateur !' });
        }
        if (!email) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir l\'adresse email de l\'utilisateur !' });
        }

        if (!role) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner le role !' });
        }

        const existingE = await getUserByEmail(email);
        if (existingE) {
            return res.status(400).json({ Status: false, message: "Cette adresse email existe déjà !" });
        }

        if (!userid) {
            return res.status(400).json({ Status: false, message: 'Utilisateur non spécifié !' });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        

        const user = await User.create({
                    nom: nom,
                    email: email,
                    direction_id : 0,
                    role : role,
                    password : hash,
                    userid,
                });

        res.status(201).json({ Status: true, message: 'Utilisateur crée avec succès !', Result: user });
    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ Status: false, Error: `Erreur serveur : ${err.message}` });
    }
});

router.put('/modifier/:id', upload.none(), async (req, res) => {
    const { id } = req.params;
    const { nom, email, role, userid } = req.body;

    try {
        // Vérifier si le categorie existe
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                Status: false,
                message: 'Utilisateur non trouvé.',
            });
        }
        if (!nom) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le nom du user!' });
        }
        user.nom = nom;
        user.email = email;
        user.role = role;
        user.userid = userid;

        await user.save();

        res.status(200).json({
            Status: true,
            message: 'Utilisateur modifié avec succès.',
            Result: user
        });
    } catch (err) {
        console.error("Erreur lors de la modification du user :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la modification du user : ${err.message}`,
        });
    }
});


// Route pour récupérer la liste des utilisateur
router.get('/liste', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit
    const offset = (page - 1) * limit; // Calcul de l'offset
    try {
        const [results, metadata] = await sequelize.query(`
            SELECT 
                u.id AS id,
                u.nom, 
                u.email, 
                u.role 
                FROM users AS u
                ORDER BY u.id DESC
            `);

        // Assurez-vous que results est un tableau
        const resultsArray = Array.isArray(results) ? results : (results ? [results] : []);

        console.log(resultsArray);

        res.status(200).json({
            Status: true,
            Result: resultsArray,
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la récupération des utilisateurs : ${err.message}`,
        });
    }
});
// Route pour supprimer un utilisateur
router.delete('/supprimer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si l utilisateur existe
        const utilisateur = await User.findByPk(id);
        if (!utilisateur) {
            return res.status(404).json({
                Status: false,
                message: 'Utilisateur non trouvé.',
            });
        }

        //getUserByVente
        const existingVente = await getUserByVente(id);
        if (existingVente) {
            return res.status(404).json({ Status: false, message: "Suppression impossible ! Cet utilisateur est lié à certaines données" });
        }
        /*const existingAppro = await getUserByAppro(id);
        if (existingAppro) {
            return res.status(400).json({ Status: false, message: "Suppression impossible ! Cet utilisateur est lié à certaines données" });
        }
        const existingApprob = await getUserByApprob(id);
        if (existingApprob) {
            return res.status(400).json({ Status: false, message: "Suppression impossible ! Cet utilisateur est lié à certaines données" });
        }
        const existingCat = await getUserByCat(id);
        if (existingCat) {
            return res.status(400).json({ Status: false, message: "Suppression impossible ! Cet utilisateur est lié à certaines données" });
        }
        const existingComp = await getUserByComp(id);
        if (existingComp) {
            return res.status(400).json({ Status: false, message: "Suppression impossible ! Cet utilisateur est lié à certaines données" });
        }*/

            /*const checks = [getUserByVente, getUserByAppro, getUserByApprob, getUserByCat, getUserByComp, getUserByInv, getUserByInvb, getUserByUnitec, getUserByPro];
            for (const check of checks) {
            if (await check(id)) {
                return res.status(404).json({ 
                Status: false, 
                message: "Suppression impossible ! Cet utilisateur est lié à certaines données" 
                });
            }
            }*/

        // Supprimer utilisateur
        await utilisateur.destroy();

        res.status(200).json({
            Status: true,
            message: 'Utilisateur supprimé avec succès.',
        });
    } catch (err) {
        console.error("Erreur lors de la suppression lutilisateur :", err);
        res.status(500).json({
            Status: false,
            Error: `Erreur lors de la suppression de lutilisateur : ${err.message}`,
        });
    }
});


export default router;
