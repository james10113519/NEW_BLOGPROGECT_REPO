const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            const same = await bcrypt.compare(password, user.password);
            if (same) {
                // Store user session
                req.session.userId = user._id;
                // Save the session before redirecting
                req.session.save((err) => {
                    if (err) {
                        req.flash('validationErrors', 'Session save error. Please try again.');
                        return res.redirect('/login');
                    }
                    return res.redirect('/');
                });
            } else {
                req.flash('validationErrors', 'Incorrect password');
                return res.redirect('/login');
            }
        } else {
            req.flash('validationErrors', 'Username not found');
            return res.redirect('/login');
        }
    } catch (error) {
        req.flash('validationErrors', 'An error occurred. Please try again.');
        return res.redirect('/login');
    }
};
