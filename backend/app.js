const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const session = require('express-session');
const cookieParser = require('cookie-parser');


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'ton-secret-securise',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Met "true" en production avec HTTPS
}));
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        return next(); // Autorise l'accès
    } else {
        res.redirect('/login.html'); // Redirige vers la page de connexion
    }
}


// Servir des fichiers statiques (dossier public)
app.use(express.static(path.join(__dirname, '../public',))); // Assure-toi que "confirmation.html" est dans "public/"
app.get('/popular-destination.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/destinations.html'));
});
app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});


// Servir la page "Contact"
app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/contact.html'));
});

// Servir la page "Réservation"
app.get('/reservation.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reservation.html'));
});

// Page de confirmation après une réservation
app.get('/confirmation.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/confirmation.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});

// Modèle de réservation
const Reservation = mongoose.model('Reservation', {
    firstName: String,
    lastName: String,
    phone: String,
    reservationDate: String,
    reservationTime: String,
    numberOfPeople: Number,
    price: Number,
    voyage:String,
});

// Configurer le transporteur d'email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Utilise Gmail comme service
    auth: {
        user: process.env.EMAIL_USER, // Ton email (doit correspondre à EMAIL_USER dans .env)
        pass: process.env.EMAIL_PASSWORD, // Mot de passe d'application généré
    },
});

// Fonction pour envoyer un email
async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // L'expéditeur
            to, // Destinataire
            subject, // Sujet
            text, // Contenu du message
        });
        console.log('📧 Email envoyé avec succès à :', to);
    } catch (err) {
        console.error('❌ Erreur lors de l\'envoi de l\'email :', err);
    }
}
app.post('/submit-trip', (req, res) => {
    const { country, city, region } = req.body;

    if (!country || !city || !region) {
        return res.status(400).send('Tous les champs sont requis.');
    }

    // Simuler un traitement ou une recherche dans une base de données
    const result = {
        message: "Résultat de votre recherche",
        country: country,
        city: city,
        region: region
    };

    res.json(result); // Réponse au client
});
// POST : Créer une réservation

// Endpoint pour envoyer un email
app.post('/send-email', async (req, res) => {
    const { fullName, email, subject, message, phone, date, details, address } = req.body;

    // Création du contenu de l'email
    const mailOptions = {
        from: email,
        to: 'FabienneNdouga77@gmail.com', // Ton adresse de destination
        subject: subject || 'Nouveau message de contact',
        text: `
            Nouveau message depuis le formulaire de contact :
            
            Nom : ${fullName}
            Email : ${email}
            Téléphone : ${phone || 'Non fourni'}
            Date : ${date || 'Non spécifiée'}
            Adresse : ${address || 'Non spécifiée'}
            Détails supplémentaires : ${details || 'Non fournis'}
            
            Message :
            ${message}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Message envoyé avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        res.status(500).send('Erreur lors de l\'envoi du message.');
    }
});
// POST : Créer une réservation
// POST : Créer une réservation
app.post('/api/reservations', async (req, res) => {
    console.log('Données reçues :', req.body); // Vérifie les données ici
    try {
        const { firstName, lastName, phone, reservationDate, reservationTime, numberOfPeople, price, voyage } = req.body;
        console.log('Données pour l\'email :', { firstName, lastName, reservationDate, reservationTime, numberOfPeople, price, voyage });

        const newReservation = new Reservation({
            firstName,
            lastName,
            phone,
            reservationDate,
            reservationTime,
            numberOfPeople,
            price,
            voyage
        });
        await newReservation.save();

        // Envoyer l'email de confirmation
        await sendEmail(
            req.body.email || process.env.EMAIL_USER,
            `Confirmation de Réservation pour ${firstName} ${lastName}`,
            `Bonjour ${firstName},\n\nVotre réservation a été confirmée avec succès :\n\nDate : ${reservationDate}\nHeure : ${reservationTime}\nNombre de personnes : ${numberOfPeople}\nPrix : ${price}\nVogage selectionné : ${voyage}\n\nMerci d'avoir choisi Fab Travel !`
        );

        // Redirection vers confirmation.html
        res.redirect('/confirmation.html');
    } catch (err) {
        console.error('Erreur lors de la réservation :', err);
        res.status(500).send('Erreur lors de la réservation');
    }
});


// GET : Obtenir toutes les réservations
app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.status(200).json(reservations);
    } catch (err) {
        res.status(500).send('Erreur lors du chargement des réservations');
    }
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME; // Chargé depuis .env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Chargé depuis .env

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Vérifie si les identifiants correspondent
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Générer un token JWT
        const token = jwt.sign(
            { username }, // Payload
            process.env.JWT_SECRET, // Clé secrète pour signer le token
            { expiresIn: '1h' } // Le token est valide 1h
        );

        // Envoyer le token dans un cookie HTTP-only
        res.cookie('auth_token', token, { httpOnly: true });

        // Rediriger vers la page admin
        return res.redirect('/admin');
    } else {
        // Si les identifiants sont incorrects
        return res.status(401).send('Identifiants incorrects');
    }
});

function isAuthenticated(req, res, next) {
    const token = req.cookies.auth_token; // Récupérer le token dans les cookies

    if (!token) {
        // Rediriger vers la page de connexion si pas de token
        return res.redirect('../login.html');
    }

    try {
        // Vérifie le token avec la clé secrète
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Ajoute les infos utilisateur à la requête
        next(); // Passe à la page admin
    } catch (err) {
        // Si le token est invalide ou expiré
        return res.redirect('../login.html');
    }
}




// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion à MongoDB :', err));

// Démarrer le serveur
app.listen(PORT, () => console.log(`🚀 Serveur actif sur http://localhost:${PORT}`));
