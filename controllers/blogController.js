const BlogPost = require('../models/BlogPost');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/img';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware for validation
const validateMiddleware = (req, res, next) => {
    if (!req.file || !req.body.title || !req.body.body) {
        req.flash('validationErrors', ['Title, body, and image are required']);
        return res.redirect('/posts/new');
    }
    next();
};

// Middleware to check if user is logged in
const authMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }
        next();
    } catch (error) {
        return res.redirect('/login');
    }
};

// Middleware to redirect if authenticated
const redirectIfAuthenticatedMiddleware = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    next();
};

// Controller actions for blog posts
const index = async (req, res) => {
    try {
        const blogposts = await BlogPost.find({}).populate('userId');
        res.render('index', { blogposts, loggedIn: res.locals.loggedIn });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};

const about = (req, res) => {
    res.render('about', { loggedIn: res.locals.loggedIn });
};

const contact = (req, res) => {
    res.render('contact', { loggedIn: res.locals.loggedIn });
};

const showPost = async (req, res) => {
    try {
        const blogpost = await BlogPost.findById(req.params.id).populate('userId');
        if (!blogpost) {
            return res.status(404).send('Post not found');
        }
        res.render('post', { blogpost, loggedIn: res.locals.loggedIn });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};

const showCreateForm = (req, res) => {
    if (req.session.userId) {
        return res.render('create', {
            createPost: true
        });
    }
    res.redirect('/auth/login');
};

const storePost = async (req, res) => {
    try {
        const { title, body } = req.body;

        // Check for duplicate title
        const existingTitle = await BlogPost.findOne({ title });
        if (existingTitle) {
            req.flash('validationErrors', ['A post with the same title already exists']);
            return res.redirect('/posts/new');
        }

        // Check for duplicate body
        const existingBody = await BlogPost.findOne({ body });
        if (existingBody) {
            req.flash('validationErrors', ['A post with the same body already exists']);
            return res.redirect('/posts/new');
        }

        // Prepare new post data
        const newPost = {
            title,
            body,
            userId: req.session.userId,
            image: '/img/' + req.file.filename,
            imagePath: 'public/img/' + req.file.filename
        };

        await BlogPost.create(newPost);
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};

// Export the controllers and middleware
module.exports = {
    index,
    about,
    contact,
    showPost,
    showCreateForm,
    storePost,
    upload,
    validateMiddleware,
    authMiddleware,
    redirectIfAuthenticatedMiddleware
};
