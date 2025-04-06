app.get('/api/destinations', async (req, res) => {
    try {
        const destinations = await Destination.find();
        res.status(200).json(destinations);
    } catch (err) {
        res.status(500).send('Erreur lors du chargement des destinations');
    }
});
