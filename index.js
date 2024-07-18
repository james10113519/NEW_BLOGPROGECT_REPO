const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
port = 4000;
}


const uri = 'mongodb+srv://jamesprab1011:Jj10113519@cluster0.8xukql5.mongodb.net/models?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected!'))
    .catch(err => console.log('Database connection error:', err));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.errors = req.flash('validationErrors') || [];
    next();
});

app.use((req, res, next) => {
    res.locals.loggedIn = req.session.userId ? true : false;
    next();
});

const blogController = require('./controllers/blogController');
const storeUserController = require('./controllers/storeUser');
const showRegisterFormController = require('./controllers/showRegisterForm');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', blogController.index);
app.get('/about', blogController.about);
app.get('/contact', blogController.contact);
app.get('/post/:id', blogController.showPost);
app.get('/posts/new', blogController.authMiddleware, blogController.showCreateForm);
app.post('/posts/store', blogController.upload.single('image'), blogController.validateMiddleware, blogController.storePost);

app.get('/register', blogController.redirectIfAuthenticatedMiddleware, showRegisterFormController);
app.post('/users/register', blogController.redirectIfAuthenticatedMiddleware, storeUserController);
app.get('/login', blogController.redirectIfAuthenticatedMiddleware, loginController);
app.post('/users/login', blogController.redirectIfAuthenticatedMiddleware, loginUserController);
app.get('/logout', logoutController);

app.use((req, res, next) => {
    res.status(404).render('layouts/notfound');
});

app.listen(PORT, (err) => {
    if (err) {
        console.error(`Error starting server on port ${PORT}:`, err);
    } else {
        console.log(`App listening on port ${PORT}`);
    }
});
