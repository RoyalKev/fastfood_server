// routes/produitRoutes.js
import express from 'express';
import multer from 'multer';
import { Op, Sequelize } from "sequelize";
import { Composition, Lignevente, Mouvementstock, Produit, Table, Uniteconversion, User, Vente } from '../../models/index.js';
import { getUnitemesureByLib } from '../../services/unitemesureService.js';
import { getCategorieID } from '../../services/produitService.js';
import sequelize from '../../config/database.js';
const upload = multer();

const router = express.Router();

router.post('/nouveau', upload.none(), async (req, res) => {
  const t = await sequelize.transaction(); // Démarre une transaction
  try {
    const { venteData, montantlivraison, reduction, nomclient, userid, venteType, selectedTable } = req.body;
    console.log(venteData)

    let erreurs = [];

    if (venteType=="Table"){
      if (!selectedTable) {
        //return res.status(400).json({ Status: false, message: 'Veuillez sélectionner la table !' });
        erreurs.push(`Veuillez sélectionner la table !`);
      }
    }

    // Création de la vente
    let numero = null;
    const totalVentes = await Vente.count();
    
    if (totalVentes < 99){
      numero = "V-00" + totalVentes;
    }else if (totalVentes > 99 && totalVentes < 999) {
      numero = "V-0" + totalVentes;
    }else{
      numero = "V-" + totalVentes;
    }

    let tableid = null;
    if (selectedTable > 0){ tableid = selectedTable ;}else{tableid = null}
    const vente = await Vente.create(
      {
        numero: numero, // Numéro unique
        type_vente: venteType,
        table_id: tableid,
        date: new Date(),
        statut: venteData.statut,
        montant: venteData.montant, // On mettra à jour après
        montantlivraison: montantlivraison,
        reduction: reduction,
        nomclient: nomclient,
        userid : venteData.userid,
      },
      { transaction: t }
    );

    for (const item of venteData.lignes) {
      const article = await Uniteconversion.findByPk(item.produit_id);
      if (!article) {
        erreurs.push(`Produit ID ${item.produit_id} introuvable`);
        continue;
      }

      if (article.type === "Plat") {
        // Vente d'un plat
        //GESTION DES PRODUITS DE COMPOSITION
        const compositions = await Composition.findAll({
          where: { produit_converti_id: article.id },
          transaction: t,
        });
        for (const compo of compositions) {
          const produitSource = await Produit.findByPk(compo.produit_id, { transaction: t });
          if (!produitSource) {
            erreurs.push(`Produit source ID ${compo.produit_id} introuvable`);
            //return res.status(400).json({ message: `Produit source ID ${compo.produit_id} introuvable` });
            continue;
          }

          let quantiteRequise = compo.quantite * item.quantite;
          if (produitSource.stock_bloquant == "Oui"){
            if (produitSource.stock < quantiteRequise) {
              erreurs.push(`Stock insuffisant pour yyy ${produitSource.designation} (nécessaire: ${quantiteRequise}, disponible: ${produitSource.stock})`);
              //return res.status(400).json({ message: `Stock insuffisant pour ${produitSource.designation} (nécessaire: ${quantiteRequise}, disponible: ${produitSource.stock})` });
              continue;
            }
        }
          // Mise à jour du stock du produit source
          //produitSource.stock -= quantiteRequise;
          //await produitSource.save({ transaction: t });

          /*await Mouvementstock.create({
            date: new Date(),
            produit_id: produitSource.id,
            quantite: quantiteRequise,
            type_operation: 'Vente',
            type_produit: 'PS',
            userid
          }, { transaction: t });*/
        }

        //FIN GESTION PRODUIT COMPOS

        /*if (article.stock < item.quantite) {
          erreurs.push(`Stock insuffisant pour ${article.designation}`);
          //return res.status(400).json({ message: `Stock insuffisant pour ${article.designation}` });
          continue;
        }
        article.stock -= item.quantite;*/
      }
      else if (article.type === "Boisson") {
        if (article.unite === "Bouteille") {
          // Vente de bouteille
          if (article.stock < item.quantite) {
            erreurs.push(`Stock insuffisant de : ${article.designation}`);
            continue;
          }
          //article.stock -= item.quantite;
        }
        else if (article.unite === "Verre") {
          // Vente de verre
          const quantiteMlRequise = item.quantite * article.contenance;
          if (article.stock < item.quantite) {
            const bouteilleMere = await Uniteconversion.findByPk(article.bouteilleMereId);
            if (bouteilleMere && bouteilleMere.stock > 0) {
              //bouteilleMere.stock -= 1;
              //article.stock += bouteilleMere.contenance;
              //article.stock += bouteilleMere.contenance;
              //await bouteilleMere.save({ transaction: t });

              /*await Mouvementstock.create({
                date: new Date(),
                produit_id: article.id,
                quantite: bouteilleMere.contenance,
                type_operation: 'Décomposition',
                type_produit: 'Boisson',
                userid
              }, { transaction: t });

              await Mouvementstock.create({
                date: new Date(),
                produit_id: bouteilleMere.id,
                quantite: 1,
                type_operation: 'Décomposition',
                type_produit: 'Boisson',
                userid
              }, { transaction: t });*/

            } else {
              erreurs.push(`Stock insuffisant pour ${article.designation}`);
              continue;
            }
          }
          //article.stock -= quantiteMlRequise;
          //article.stock -= item.quantite;
        }
      }


      const cat = await getCategorieID(item.produit_id)
      const categorie_id = cat.categorie_id;
      const benef = article.prix == 0 ? 0 : (article.prix - article.prix_revient) * item.quantite;

      await Lignevente.create(
        {
          categorie_id: categorie_id,
          designation: item.designation,
          produit_id: item.produit_id,
          vente_id: vente.id,
          prix_unitaire: item.prix_unitaire,
          quantite: item.quantite,
          unite: item.unite,
          montligne: item.montligne,
          qteligne: item.quantite,
          benef: benef,
          statut: vente.statut,
          userid: item.userid,
        },
        { transaction: t }
      );

    }

    if (erreurs.length > 0) { 
      await t.rollback();
      return res.status(400).json({ success: false, message: "Certaines ventes ont échoué", erreurs : erreurs });
    }
    //res.json({ message: "Vente enregistrée avec succès" });
    await vente.save({ transaction: t });
    await t.commit();
    res.status(201).json({ message: "Vente enregistrée avec succès", venteId: vente.id });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
})

router.put('/modifier/:id', upload.none(), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { venteData, montantlivraison, reduction, nomclient, userid, venteType, selectedTable } = req.body;
    const { id } = req.params;

    let erreurs = [];

    if (venteType === "Table" && !selectedTable) {
      erreurs.push("Veuillez sélectionner la table !");
    }

    const vente = await Vente.findByPk(id, { transaction: t });
    if (!vente) {
      await t.rollback();
      return res.status(404).json({ message: "Vente non trouvée." });
    }
    let tableid = null;
    if (venteType === "Table" && selectedTable) {
        tableid = selectedTable;
    }else{
        tableid = null;
    }
    
    let mt_livraison = montantlivraison > 0 ? montantlivraison : 0

    // Mise à jour des infos générales de la vente
    vente.type_vente = venteType;
    vente.table_id = tableid;
    vente.montant = venteData.montant;
    vente.montantlivraison = mt_livraison;
    vente.reduction = reduction;
    vente.nomclient = nomclient;
    vente.statut = venteData.statut;
    vente.date = new Date();
    await vente.save({ transaction: t });

    // Supprimer les anciennes lignes de vente
    await Lignevente.destroy({ where: { vente_id: id }, transaction: t });

    // Ajouter les nouvelles lignes
    for (const item of venteData.lignes) {
      const article = await Uniteconversion.findByPk(item.produit_id);
      if (!article) {
        erreurs.push(`Produit ID ${item.produit_id} introuvable`);
        continue;
      }

      const cat = await getCategorieID(item.produit_id);
      const categorie_id = cat.categorie_id;

      const benef = article.prix == 0 ? 0 : (article.prix - article.prix_revient) * item.quantite;

      await Lignevente.create(
        {
          categorie_id: categorie_id,
          designation: item.designation,
          produit_id: item.produit_id,
          vente_id: vente.id,
          prix_unitaire: item.prix_unitaire,
          quantite: item.quantite,
          unite: item.unite,
          montligne: item.montligne,
          qteligne: item.quantite,
          benef: benef,
          statut: vente.statut,
          userid: item.userid,
        },
        { transaction: t }
      );
    }

    if (erreurs.length > 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Certaines lignes ont échoué", erreurs });
    }

    await t.commit();
    res.status(201).json({ message: "Vente modifiée avec succès", id: vente.id });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
});


router.get('/derniere_vente/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    // Récupérer la dernière vente de l'utilisateur
    const derniereVente = await Vente.findOne({
      where: { userid: userid },
      order: [['id', 'DESC']],
    });

    if (!derniereVente) {
      return res.status(404).json({ message: "Aucune vente trouvée." });
    }

    // Récupérer les lignes associées à cette vente en incluant la désignation du produit
    const lignes = await Lignevente.findAll({
      where: { vente_id: derniereVente.id },
      include: [
        {
          model: Uniteconversion, // Assurez-vous que le modèle Produit est bien importé
          as: 'produit',  // L'alias doit correspondre à celui défini dans votre association
          attributes: ['designation'],
        },
      ],
    });

    res.status(200).json({
      vente: derniereVente,
      lignes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération de la dernière vente." });
  }
});

router.post('/valider/:id', async (req, res) => {
  const t = await sequelize.transaction(); // Démarre une transaction
  try {
    const { id } = req.params;
    const vente = await Vente.findByPk(id, { transaction: t });

    if (!vente) {
      return res.status(404).json({ message: "Vente introuvable" });
    }

    if (vente.statut === "Validé") {
      return res.status(400).json({ message: "Cette vente est déjà validée." });
    }

    // Récupérer toutes les lignes de vente
    const lignesVente = await Lignevente.findAll({
      where: { vente_id: id },
      transaction: t,
    });

    for (const ligne of lignesVente) {
      const article = await Uniteconversion.findByPk(ligne.produit_id, { transaction: t });
      if (!article) continue;

      if (article.type === "Plat") {
        // RESTAURATION DES PRODUITS SOURCES
        const compositions = await Composition.findAll({
          where: { produit_converti_id: article.id },
          transaction: t,
        });

        for (const compo of compositions) {
          const produitSource = await Produit.findByPk(compo.produit_id, { transaction: t });
          if (!produitSource) continue;

          let quantiteRestituee = compo.quantite * ligne.quantite;
          produitSource.stock -= quantiteRestituee;
          await produitSource.save({ transaction: t });

          await Mouvementstock.create({
            date: new Date(),
            produit_id: produitSource.id,
            quantite: quantiteRestituee,
            type_operation: 'Vente',
            type_produit: 'PS',
            userid: vente.userid
          }, { transaction: t });
        }
      }

      if (article.type === "Boisson") {
        if (article.unite === "Bouteille") {
          article.stock -= ligne.quantite;
        } else if (article.unite === "Verre") {
          const quantiteMlRestituee = ligne.quantite * article.contenance;
          article.stock -= quantiteMlRestituee;
        }
      } else {
        article.stock -= ligne.quantite;
      }

      await article.save({ transaction: t });

      await Mouvementstock.create({
        date: new Date(),
        produit_id: ligne.produit_id,
        quantite: ligne.quantite,
        type_operation: 'Vente',
        type_produit: article.type,
        userid: vente.userid
      }, { transaction: t });

      ligne.statut = "Validé";
      await ligne.save({ transaction: t });

    }

    // Mettre le statut de la vente à "Validée"
    vente.statut = "Validé";
    await vente.save({ transaction: t });
    await t.commit();
    res.json({ message: "Vente validée avec succès", vente });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
});

router.post('/annuler/:id', async (req, res) => {
  const t = await sequelize.transaction(); // Démarre une transaction
  try {
    const { id } = req.params;
    const vente = await Vente.findByPk(id, { transaction: t });

    if (!vente) {
      return res.status(404).json({ message: "Vente introuvable" });
    }

    if (vente.statut === "Annulée") {
      return res.status(400).json({ message: "Cette vente est déjà annulée." });
    }

    // Récupérer toutes les lignes de vente
    const lignesVente = await Lignevente.findAll({
      where: { vente_id: id },
      transaction: t,
    });

    for (const ligne of lignesVente) {
      const article = await Uniteconversion.findByPk(ligne.produit_id, { transaction: t });
      if (!article) continue;

      if (article.type === "Plat") {
        // RESTAURATION DES PRODUITS SOURCES
        const compositions = await Composition.findAll({
          where: { produit_converti_id: article.id },
          transaction: t,
        });

        for (const compo of compositions) {
          const produitSource = await Produit.findByPk(compo.produit_id, { transaction: t });
          if (!produitSource) continue;

          let quantiteRestituee = compo.quantite * ligne.quantite;
          produitSource.stock += quantiteRestituee;
          await produitSource.save({ transaction: t });

          await Mouvementstock.create({
            date: new Date(),
            produit_id: produitSource.id,
            quantite: quantiteRestituee,
            type_operation: 'Annulation Vente',
            type_produit: 'PS',
            userid: vente.userid
          }, { transaction: t });
        }
      }

      if (article.type === "Boisson") {
        if (article.unite === "Bouteille") {
          article.stock += ligne.quantite;
        } else if (article.unite === "Verre") {
          const quantiteMlRestituee = ligne.quantite * article.contenance;
          article.stock += quantiteMlRestituee;
        }
      } else {
        article.stock += ligne.quantite;
      }

      await article.save({ transaction: t });

      await Mouvementstock.create({
        date: new Date(),
        produit_id: ligne.produit_id,
        quantite: ligne.quantite,
        type_operation: 'Annulation Vente',
        type_produit: article.type,
        userid: vente.userid
      }, { transaction: t });

      ligne.statut = "Annulée";
      await ligne.save({ transaction: t });
    }

    // Mettre le statut de la vente à "Annulée"
    vente.statut = "Annulée";
    await vente.save({ transaction: t });

    await t.commit();
    res.json({ message: "Vente annulée avec succès" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
});

//VENTES MENSUELLES
router.get('/ventes-par-mois', async (req, res) => {
  try {
    const annee = new Date().getFullYear(); // Année en cours

    const ventes = await Vente.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'mois'],
        [sequelize.fn('SUM', sequelize.col('montant')), 'total']
      ],
      where: {
        date: {
          [Op.between]: [`${annee}-01-01`, `${annee}-12-31`]
        },
        statut:'Validé'
      },
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      raw: true
    });

    // Initialiser un tableau avec 12 mois à 0
    let resultats = new Array(12).fill(0);

    ventes.forEach(vente => {
      resultats[vente.mois - 1] = parseFloat(vente.total);
    });

    res.json(resultats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des ventes" });
  }
});

router.get('/ventes-par-jour', async (req, res) => {
  try {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourdHui);
    demain.setDate(demain.getDate() + 1);

    const ventes = await Lignevente.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantite")), "quantiteTotale"],
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "montantTotal"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { date: { [Op.between]: [aujourdHui, demain] }, statut:'Validé' }
        },
        {
          model: Uniteconversion,
          as: "produit", // Correct alias défini dans l'association
          attributes: ["designation"],
        }
      ],
      group: ["produit.designation"], // Corriger le groupement
      raw: true
    });

    const montantGlobal = ventes.reduce((total, vente) => total + parseFloat(vente.montantTotal || 0), 0);
    console.log(ventes)
    res.json({ ventes, montantGlobal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des ventes" });
  }
});

router.get('/ventes-boisson-du-jour', async (req, res) => {
  try {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourdHui);
    demain.setDate(demain.getDate() + 1);

    const ventes = await Lignevente.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantite")), "quantiteTotale"],
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "montantTotal"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { date: { [Op.between]: [aujourdHui, demain] }, statut:'Validé' }
        },
        {
          model: Uniteconversion,
          as: "produit", // Correct alias défini dans l'association
          attributes: ["designation","unite"],
          where: { type: "Boisson" }
        }
      ],
      group: ["produit.designation"], // Corriger le groupement
      raw: true
    });

    const montantGlobal = ventes.reduce((total, vente) => total + parseFloat(vente.montantTotal || 0), 0);
    console.log(ventes)
    res.json({ ventes, montantGlobal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des ventes" });
  }
});

router.get('/ventes-plat-du-jour', async (req, res) => {
  try {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourdHui);
    demain.setDate(demain.getDate() + 1);

    const ventes = await Lignevente.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantite")), "quantiteTotale"],
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "montantTotal"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { date: { [Op.between]: [aujourdHui, demain] }, statut:'Validé' }
        },
        {
          model: Uniteconversion,
          as: "produit", // Correct alias défini dans l'association
          attributes: ["designation","unite"],
          where: { type: "Plat" }
        }
      ],
      group: ["produit.designation"], // Corriger le groupement
      raw: true
    });
    const montantGlobal = ventes.reduce((total, vente) => total + parseFloat(vente.montantTotal || 0), 0);

    //POUR LE TOTAL DU JOUR
    const result = await Lignevente.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "total_jour"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { date: { [Op.between]: [aujourdHui, demain] }, statut:'Validé' }
        }
      ],
      raw: true
    });
    
    const montantGlobal_jour = parseFloat(result.total_jour) || 0;

    console.log(ventes)
    res.json({ ventes, montantGlobal, montantGlobal_jour });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des ventes" });
  }
});

//VENTES PAR CAISSIER

router.get('/ventes-boisson-du-jour-caissier/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourdHui);
    demain.setDate(demain.getDate() + 1);

    const ventes = await Lignevente.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantite")), "quantiteTotale"],
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "montantTotal"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { date: { [Op.between]: [aujourdHui, demain] }, userid: userid, statut:'Validé' }
        },
        {
          model: Uniteconversion,
          as: "produit", // Correct alias défini dans l'association
          attributes: ["designation","unite"],
          where: { type: "Boisson" }
        }
      ],
      group: ["produit.designation"], // Corriger le groupement
      raw: true
    });

    const montantGlobal = ventes.reduce((total, vente) => total + parseFloat(vente.montantTotal || 0), 0);
    console.log(ventes)
    res.json({ ventes, montantGlobal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des ventes" });
  }
});

router.get('/ventes-plat-du-jour-caissier/:userid', async (req, res) => {
  const { userid } = req.params; 
  try {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const demain = new Date(aujourdHui);
    demain.setDate(demain.getDate() + 1);

    const ventes = await Lignevente.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantite")), "quantiteTotale"],
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "montantTotal"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { date: { [Op.between]: [aujourdHui, demain] }, userid: userid, statut:'Validé' }
        },
        {
          model: Uniteconversion,
          as: "produit", // Correct alias défini dans l'association
          attributes: ["designation","unite"],
          where: { type: "Plat" }
        }
      ],
      group: ["produit.designation"], // Corriger le groupement
      raw: true
    });

    //POUR LE TOTAL DU JOUR
    const result = await Lignevente.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "total_jour"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { date: { [Op.between]: [aujourdHui, demain] }, userid: userid, statut:'Validé' }
        }
      ],
      raw: true
    });
    
    const montantGlobal_jour = parseFloat(result.total_jour) || 0;

    const montantGlobal = ventes.reduce((total, vente) => total + parseFloat(vente.montantTotal || 0), 0);
    console.log(ventes)
    res.json({ ventes, montantGlobal, montantGlobal_jour });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des ventes" });
  }
});

//LISTE DES VENTES

router.get("/toutes-les-ventes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Page actuelle
    const limit = parseInt(req.query.limit) || 10; // Nombre d'éléments par page
    const offset = (page - 1) * limit;

    const { count, rows: ventes } = await Vente.findAndCountAll({
      include: [
        {
          model: Lignevente,
          as: "lignevente",
          include: [{ model: Uniteconversion, as: "produit", attributes: ["designation"] }],
        },
        {
          model: Table,
          as: 'table',
          attributes: ['reference', 'emplacement'],
          required: false, // même si la table est null
        },
        {
          model: User,
          as: 'user',
          attributes: ['nom'],
          required: false, // même si la table est null
        },
      ],
      order: [["date", "DESC"]], // Trier par date décroissante
      limit,
      offset,
    });

    const result = await Lignevente.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "total"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
          where: { statut:'Validé' }
        }
      ],
      raw: true
    });

    const totalvente = parseFloat(result.total) || 0;

    res.json({ventes, totalvente, totalPages: Math.ceil(count / limit), currentPage: page,});
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get('/vente_en_cours/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    const page = parseInt(req.query.page) || 1; // Page actuelle
    const limit = parseInt(req.query.limit) || 10; // Nombre d'éléments par page
    const offset = (page - 1) * limit;

    const { count, rows: ventes } = await Vente.findAndCountAll({
      where: { statut:'En cours', userid: userid },
      include: [
        {
          model: Lignevente,
          as: "lignevente",
          include: [{ model: Uniteconversion, as: "produit", attributes: ["designation"] }],
        },
        {
          model: Table,
          as: 'table',
          attributes: ['reference', 'emplacement'],
          required: false, // même si la table est null
        },
      ],
      order: [["date", "DESC"]], // Trier par date décroissante
      limit,
      offset,
    });

    const result = await Lignevente.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "total"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
        }
      ],
      where: { statut:'En cours', userid: userid },
      raw: true
    });

    const totalvente = parseFloat(result.total) || 0;

    res.json({ventes, totalvente, totalPages: Math.ceil(count / limit), currentPage: page,});
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
//RECUPERATION DE LA VENTE POUR MODIFICATION
router.get('/vente/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const vente = await Vente.findOne({
      where: { id : id },
      include: [
        {
          model: Table,
          as: 'table',
          attributes: ['reference', 'emplacement'],
          required: false, // même si la table est null
        },
      ],
    });
    if (!vente || vente.length === 0) {
      return res.status(404).json({ message: 'La vente n\'existe pas.' });
    }
    res.status(200).json(vente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération de la vente." });
  }
});
//RECUPERATION DES LIGNES DE VENTE POUR MODIFICATION
router.get('/ligne_ventes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const lignes = await Lignevente.findAll({
      where: { vente_id : id },
      include: [
        {
          model: Uniteconversion,
          as: 'produit',
          attributes: ['designation', 'unite'],
        },
      ],
    });
    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: 'Aucune ligne trouvée pour cette vente.' });
    }
    res.status(200).json(lignes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des lignes de vente." });
  }
});

router.get('/vente_validee/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    const page = parseInt(req.query.page) || 1; // Page actuelle
    const limit = parseInt(req.query.limit) || 10; // Nombre d'éléments par page
    const offset = (page - 1) * limit;

    const { count, rows: ventes } = await Vente.findAndCountAll({
      where: { userid: userid },
      include: [
        {
          model: Lignevente,
          as: "lignevente",
          include: [{ model: Uniteconversion, as: "produit", attributes: ["designation"] }],
        },
        {
          model: Table,
          as: 'table',
          attributes: ['reference', 'emplacement'],
          required: false, // même si la table est null
        },
      ],
      order: [["id", "DESC"]], // Trier par date décroissante
      limit,
      offset,
    });

    const result = await Lignevente.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("montligne")), "total"]
      ],
      include: [
        {
          model: Vente,
          as: "vente",
          attributes: [],
        }
      ],
      where: { statut:'Validé', userid: userid },
      raw: true
    });

    const totalvente = parseFloat(result.total) || 0;

    res.json({ventes, totalvente, totalPages: Math.ceil(count / limit), currentPage: page,}); 
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get('/tendances', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let startCurrent, endCurrent, startPrevious, endPrevious;

    if (startDate && endDate) {
      startCurrent = new Date(startDate);
      endCurrent = new Date(endDate);

      // Période précédente (même durée avant startCurrent)
      const diff = endCurrent.getTime() - startCurrent.getTime();
      startPrevious = new Date(startCurrent.getTime() - diff);
      endPrevious = new Date(endCurrent.getTime() - diff);
    } else {
      const now = new Date();
      startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      endCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endPrevious = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    // Ventes de la période actuelle
    const ventesActuelles = await Lignevente.findAll({
      attributes: [
        'produit_id',
        [Sequelize.fn('SUM', Sequelize.col('quantite')), 'total_qte'],
        [Sequelize.fn('SUM', Sequelize.col('montligne')), 'total_montant']
      ],
      include: [{ model: Uniteconversion, as: "produit", attributes: ['designation'] }],
      where: {
        createdAt: { [Op.between]: [startCurrent, endCurrent] }, statut: 'Validé'
      },
      group: ['produit_id']
    });

    // Ventes de la période précédente
    const ventesPrecedentes = await Lignevente.findAll({
      attributes: [
        'produit_id',
        [Sequelize.fn('SUM', Sequelize.col('quantite')), 'total_qte']
      ],
      where: {
        createdAt: { [Op.between]: [startPrevious, endPrevious] }, statut: 'Validé'
      },
      group: ['produit_id']
    });

    // Mapping pour comparaison
    const mapVentesPrecedentes = {};
    ventesPrecedentes.forEach((vente) => {
      mapVentesPrecedentes[vente.produit_id] = parseFloat(vente.dataValues.total_qte) || 0;
    });

    const tendances = ventesActuelles.map((vente) => {
      const quantiteActuelle = parseFloat(vente.dataValues.total_qte) || 0;
      const montantActuel = parseFloat(vente.dataValues.total_montant) || 0;
      const quantitePrecedente = mapVentesPrecedentes[vente.produit_id] || 0;

      let tendance = 'Stable ➖';
      if (quantiteActuelle > quantitePrecedente) tendance = 'Hausse 📈';
      else if (quantiteActuelle < quantitePrecedente) tendance = 'Baisse 📉';

      return {
        designation: vente.produit.designation,
        quantite: quantiteActuelle,
        montant: montantActuel,
        tendance
      };
    });

    res.json({ success: true, tendances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/stats-ventes-mensuelles', async (req, res) => {
  try {
    const now = new Date();

    const debutMoisActuel = new Date(now.getFullYear(), now.getMonth(), 1);
    const debutMoisPasse = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMoisPasse = new Date(now.getFullYear(), now.getMonth(), 0); // dernier jour du mois passé

    const totalMoisActuel = await Vente.sum('montant', {
      where: {
        date: {
          [Op.gte]: debutMoisActuel,
        },
        statut: 'Validé'
      },
    });

    const totalMoisPasse = await Vente.sum('montant', {
      where: {
        date: {
          [Op.between]: [debutMoisPasse, finMoisPasse],
        },
        statut: 'Validé'
      },
    });

    res.status(200).json({
      moisActuel: totalMoisActuel || 0,
      moisPasse: totalMoisPasse || 0
    });

  } catch (error) {
    console.error('Erreur stats ventes mensuelles :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/comparatif-mensuel', async (req, res) => {
  try {
    const now = new Date();

    const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const endCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrevious = new Date(now.getFullYear(), now.getMonth(), 0);

    const montantCourant = await Vente.sum('montant', {
      where: { createdAt: { [Op.between]: [startCurrent, endCurrent] }, statut: 'Validé' }
    });

    const montantPrecedent = await Vente.sum('montant', {
      where: { createdAt: { [Op.between]: [startPrevious, endPrevious] }, statut: 'Validé' }
    });

    res.json({
      success: true,
      data: {
        mois_courant: montantCourant || 0,
        mois_passe: montantPrecedent || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.get('/vente-hebdomadaire', async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 28); // 4 dernières semaines

    const ventes = await Vente.findAll({
      attributes: [
        [Sequelize.fn("YEARWEEK", Sequelize.col("createdAt")), "semaine"],
        [Sequelize.fn("SUM", Sequelize.col("montant")), "montant_total"]
      ],
      where: {
        createdAt: { [Op.between]: [startDate, now] }, statut: 'Validé'
      },
      group: [Sequelize.fn("YEARWEEK", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("createdAt")), "ASC"]]
    });

    const result = ventes.map(v => ({
      semaine: v.dataValues.semaine,
      montant: parseFloat(v.dataValues.montant_total)
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Erreur API ventes_hebdo:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
export { router as venteRouter }