//  server.ts
// ----------------------------------
//  Nodejs server for AtomAni
//
//  © Alexander Romberg @ KFTG (IMS)
// ----------------------------------

// Config
const VERSION = 'v2.0 [Beta] <i>(Nodejs-Version)</i>';
let PORT = 80;
console.clear();

// handle process arguments
if (process.argv.length > 2) {
    PORT = (Number)(process.argv[2]);
}

// Imports
import express from 'express';
import flash from 'express-flash';
import session from 'express-session';
import passport from 'passport';
import cm from './modules/consoleModule';
import pages from './modules/pages';
import userStorage from './modules/users';
import cookieParser from 'cookie-parser';
const passportConfig = require('./modules/passportConfig');

cm.log("green", `Starting Server...`);
cm.log("cyan", `Version: ${VERSION}`);
cm.log("green", `\nModules loaded`);

// Passport
passportConfig(
    passport,
    userStorage.getUserByName,
    userStorage.getUserById
);


// Server
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(flash());
app.use(session({
    secret: 'Secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.listen(PORT);


pages.init(VERSION);
cm.log("green", "Server started");
cm.log("blue", `running at: http://localhost:${PORT}`);

// Request handles
app.get('/', userStorage.checkAuthenticated, pages.sendIndex);
app.get('/welcome', userStorage.checkNotAuthenticated, pages.sendWelcome);

app.get('/selection', userStorage.checkAuthenticated, pages.sendSelection);
app.get('/selection/*', userStorage.checkAuthenticated, pages.sendSelection);

app.get('/experiment/:id', userStorage.checkAuthenticated, pages.sendExperiment);

app.get('/new/experiment', userStorage.checkAuthenticated, pages.sendNewExperiment);
app.post('/new/experiment', userStorage.checkAuthenticated, pages.handleNewExperiment);
app.get('/new/folder', userStorage.checkAuthenticated, pages.sendNewFolder);
app.post('/new/folder', userStorage.checkAuthenticated, pages.handleNewFolder);

// accounts
app.get('/logout', pages.handleLogout);
app.get('/register', userStorage.checkAuthenticated, pages.sendRegister);
app.get('/login', userStorage.checkNotAuthenticated, pages.sendLogin);

app.post('/register', userStorage.checkAuthenticated, async (req: express.Request, res: express.Response) => {
    try {
        userStorage.createUser(
            req.body.name,
            req.body.loginName,
            req.body.password,
            (req.body.canEdit === "on"),
            (req.body.isAdmin === "on"),
            req.body.organisation
        );
        res.redirect('/register');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});
app.post('/login', userStorage.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/help', pages.sendHelp);

app.use(pages.handle404);