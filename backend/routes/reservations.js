const express = require('express');
const Reservation = require('../models/Reservation');
const router = express.Router();

// Créer une nouvelle réservation

router.post('/', async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json(reservation);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la création de la réservation.' });
    }
});

// Récupérer toutes les réservations
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des réservations.' });
    }
});
app.post('/api/reservations', async (req, res) => {
    try {
        const newReservation = new Reservation(req.body);
        await newReservation.save();

        // Envoyer un email de confirmation
        await sendEmail(
            req.body.phone + '@example.com', // Adresse email du client
            'Confirmation de Réservation',
            `Bonjour ${req.body.firstName},\n\nVotre réservation a été confirmée :\nDate : ${req.body.reservationDate}\nHeure : ${req.body.reservationTime}\nNombre de personnes : ${req.body.numberOfPeople}\nPrix : ${req.body.price} \nVoyage : ${req.body.voyage}.\n\nMerci de voyager avec Fab Travel !`
        );

        // Redirection ou confirmation
        res.redirect('/confirmation.html');
    } catch (err) {
        res.status(500).send('Erreur lors de la réservation');
    }
});


module.exports = router;
