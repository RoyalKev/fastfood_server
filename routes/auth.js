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
import { getUserByEmail, getUserByNom } from '../services/userServices.js';
import User from '../models/user.js';
import { Sequelize } from "sequelize";

const router = express.Router();

router.post('/register', validateUser, register);
router.post('/login', validateUserLogin, login);
router.post('/logout', logout);

router.post('/nouveau', upload.none(), async (req, res) => {
    const { nom, email, password, direction_id, role, userid } = req.body;
    console.log(req.body)
    try {
        if (!nom) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir le nom de l\'utilisateur !' });
        }
        if (!email) {
            return res.status(400).json({ Status: false, message: 'Veuillez saisir l\'adresse email de l\'utilisateur !' });
        }

        if (!direction_id) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner la direction !' });
        }

        if (!role) {
            return res.status(400).json({ Status: false, message: 'Veuillez sélectionner le role !' });
        }

        const existingE = await getUserByEmail(email);
        if (existingE) {
            return res.status(400).json({ Status: false, message: "Cette adresse email existe déjà !" });
        }

        const existingUser = await getUserByNom(nom, direction_id);
        if (existingUser) {
            return res.status(400).json({ Status: false, message: "Cet utilisateur a déjà été enregistré !" });
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
                    direction_id : direction_id,
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
                d.nom_direction AS nom_direction
                FROM users AS u
                INNER JOIN directions AS d ON u.direction_id = d.id
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
