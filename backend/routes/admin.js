app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Enregistre l'utilisateur connecté dans une session
        req.session.isAdmin = true; // Utilise express-session
        return res.redirect('/admin'); // Redirige vers la page admin
    } else {
        res.status(401).send('Identifiants incorrects');
    }
});
