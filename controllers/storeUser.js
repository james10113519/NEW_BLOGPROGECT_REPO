const User = require('../models/User');

module.exports = async (req, res) => {
    console.log('Request Body:', req.body); // Log the request body to debug

    const { username, password } = req.body;
    if (!username || !password) {
        req.flash('validationErrors', ['Username and password are required']);
        return res.redirect('/register');
    }

    try {
        const newUser = await User.create({ username, password });
        console.log('New user created:', newUser);
        res.status(201).send('User registered');
    } catch (error) {
        if (error.errors && error.errors.username && error.errors.username.kind === 'unique') {
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message);
            req.flash('validationErrors', validationErrors);
            req.flash('data',req.body)
            return res.redirect('/register');
        }
        console.error('Error registering user:', error);
        req.flash('validationErrors', [error.message]);
        res.status(500).redirect('/register');
    }
};
