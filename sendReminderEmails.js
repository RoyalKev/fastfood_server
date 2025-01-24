import nodemailer from 'nodemailer'
import cron from 'node-cron'
import { Participant, Reunion, User } from './models/index.js';
import { Sequelize } from 'sequelize';
import sequelize from './config/database.js';

// Configurer Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Remplacez par votre hôte SMTP
    port: 587,
    secure: false,
    auth: {
        user: "kevineved@gmail.com", // Remplacez par votre email
        pass: "nkwp biia cdto oqvb",   // Remplacez par votre mot de passe
    },
});

// Fonction pour envoyer les emails
const sendReminderEmails = async () => {
    try {
        // Calculer la date du jour J-1
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedTomorrow = tomorrow.toISOString().split("T")[0]; // Format : YYYY-MM-DD

        // Trouver les réunions pour demain
            //Ceci parce que les dates incluent des heures
        const startOfDay = `${formattedTomorrow} 00:00:00`;
        const endOfDay = `${formattedTomorrow} 23:59:59`;

        /*const reunions = await Reunion.findAll({
            where: {
                date_debut_reunion: {
                    //[Sequelize.Op.like]: `${formattedTomorrow}%`,
                    [Sequelize.Op.between]: [startOfDay, endOfDay],
                },
            },
        });*/
        // Requête SQL explicite pour récupérer les réunions prévues demain
        const reunions = await sequelize.query(
            `SELECT id, date_debut_reunion FROM reunions WHERE date_debut_reunion BETWEEN :startOfDay AND :endOfDay`,
            { replacements: { startOfDay, endOfDay }, type: Sequelize.QueryTypes.SELECT }
        );

        if (reunions.length === 0) {
            console.log("Aucune réunion prévue pour demain.");
            return;
        }

        // Boucle sur chaque réunion
        for (const reunion of reunions) {
            // Requête SQL explicite pour récupérer les participants et leurs emails
            const participants = await sequelize.query(
                `SELECT u.nom, u.email 
                 FROM participants p 
                 INNER JOIN users u ON p.userid = u.id 
                 WHERE p.reunion_id = :reunionId`,
                { replacements: { reunionId: reunion.id }, type: Sequelize.QueryTypes.SELECT }
            );

            if (participants.length === 0) {
                console.log(`Aucun participant pour la réunion ID ${reunion.id}.`);
                continue;
            }

            // Préparer et envoyer les emails
            const emailPromises = participants.map((participant) => {
                const mailOptions = {
                    from: '"Organisateur de la Réunion" <your_email@example.com>',
                    to: participant.email,
                    subject: `Rappel : Réunion prévue le ${new Date(reunion.date_debut_reunion).toLocaleString()}`,
                    text: `Bonjour ${participant.nom},\n\nCeci est un rappel que vous avez une réunion prévue le ${new Date(reunion.date_debut_reunion).toLocaleString()}.\n\nCordialement,\nLe Secrétariat.`,
                };

                return transporter.sendMail(mailOptions);
            });

            await Promise.all(emailPromises);
            console.log(`Emails envoyés pour la réunion ID ${reunion.id}.`);
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi des emails :", error);
    }
};

// Programmer l'exécution du script tous les jours à 8h00
cron.schedule("0 8 * * *", async () => {
    console.log("Lancement de l'envoi des rappels...");
    await sendReminderEmails();
});


(async () => {
    console.log("Test manuel : Envoi des emails...");
    await sendReminderEmails();
    console.log("Test terminé.");
})();