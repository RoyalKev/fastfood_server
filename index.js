import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
//import boutiqueRoutes from './routes/boutique.js';
import session from 'express-session';
import dotenv from 'dotenv';
import sequelize from './config/database.js'; // Import de la configuration Sequelize
import './models/index.js'; // Import des modèles pour leur synchronisation

import { categorieRouter } from './routes/fastfood/categorie.js';
import { produitRouter } from './routes/fastfood/produit.js';
import { unitemesureRouter } from './routes/fastfood/unitemesure.js';
import { uniteconversionRouter } from './routes/fastfood/uniteconversion.js';
import { venteRouter } from './routes/fastfood/vente.js';
import { approRouter } from './routes/fastfood/appro.js';
import { compositionRouter } from './routes/fastfood/composition.js';
import { approboissonRouter } from './routes/fastfood/approboisson.js';
import { inventaireRouter } from './routes/fastfood/inventaire.js';
import { inventaireboissonRouter } from './routes/fastfood/inventaireboisson.js';
import { tableRouter } from './routes/fastfood/table.js';
dotenv.config(); // Chargement des variables d'environnement

const app = express();
const port = process.env.PORT || 3006;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: 'http://localhost:3000', // Origine autorisée
  //origin: 'http://77.37.125.3:3001', // Origine autorisée
  credentials: true, // Autoriser l'envoi des cookies
}));

app.use(bodyParser.json());

//POUR POUVOIR RECUPERER LES LOGS COTE SERVEUR
app.use((req, res, next) => {
  console.log('Requête reçue :', req.method, req.url, req.body);
  next();
});


// Routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/categorie', categorieRouter);
app.use('/api/table', tableRouter);
app.use('/api/produit', produitRouter);
app.use('/api/unitemesure', unitemesureRouter);
app.use('/api/uniteconversion', uniteconversionRouter);
app.use('/api/vente', venteRouter);
app.use('/api/appro', approRouter);
app.use('/api/composition', compositionRouter);
app.use('/api/approboisson', approboissonRouter);
app.use('/api/inventaire', inventaireRouter);
app.use('/api/inventaireboisson', inventaireboissonRouter);


app.use('/public', express.static(path.join(__dirname, 'public')));


/*app.get('/test-path', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Reunions', 'fichier_1736731706743.pdf'));
});
*/

app.get('/', (req, res) =>{
  res.send('transactionRouter');
})
// Synchronisation avec la base de données
sequelize
  .authenticate()
  .then(() => {
    console.log('Connexion à la base de données réussie.');
    //return sequelize.sync({ alter: true }); // Synchronise les modèles (alter met à jour les tables sans perte de données)
  })
  .catch((error) => {
    console.error('Impossible de se connecter à la base de données:', error);
  });

  app.listen(port, () => {
    console.log(`Example app listening on port: http://localhost:${port}`);
    //swaggerDocs(app, port);
  })
