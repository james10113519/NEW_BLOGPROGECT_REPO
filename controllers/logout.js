const logoutController = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/'); // Redirect to home page or another route after logout
    });
};

module.exports = logoutController;
