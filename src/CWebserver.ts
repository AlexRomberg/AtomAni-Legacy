import { CConfig } from './CConfig';
import { CDatabase } from './CDatabase';
import { CPages } from './CPages';
import express from 'express';
import cookieParser from 'cookie-parser';
import flash from 'express-flash';
import session from 'express-session';
import passport from 'passport';
import { CPassportConfig } from './CPassportConfig';
import morgan from 'morgan';

export class CWebserver {
    private App: express.Express;
    private Database: CDatabase;
    private Pages: CPages;
    private Config: CConfig;
    private PassportConfig: CPassportConfig;

    constructor(database: CDatabase, config: CConfig) {
        this.App = express();
        this.Database = database;
        this.Config = config;
        this.Pages = new CPages(this.Config.version);
        this.PassportConfig = new CPassportConfig(
            passport,
            database.getUserByName.bind(database),
            database.getUserById.bind(database)
        );


        this.App.set('view engine', 'ejs');
        if (this.Config.settings.loglevel >= 4) {
            this.App.use(morgan('dev'));
        }
        this.App.use(express.static('public'));
        this.App.use(express.urlencoded({ extended: false, limit: '1kb' }));
        this.App.use(express.json({ limit: '1kb' }));
        this.App.use(cookieParser());
        this.App.use(flash());
        this.App.use(session({
            secret: this.Config.server.sessionSecret,
            resave: false,
            saveUninitialized: false
        }));
        this.App.use(passport.initialize());
        this.App.use(passport.session());
        this.App.listen(this.Config.server.port);
    }

    public async initPagelisteners() {
        // Request handles
        this.App.get('/', this.checkAuthenticated, this.Pages.sendIndex.bind(this.Pages));
        this.App.get('/welcome', this.checkNotAuthenticated, this.Pages.sendWelcome.bind(this.Pages));

        this.App.get('/selection', this.checkAuthenticated, this.Pages.sendSelection.bind(this.Pages));
        this.App.get('/selection/*', this.checkAuthenticated, this.Pages.sendSelection.bind(this.Pages));

        this.App.get('/experiment/:id', this.checkAuthenticated, this.Pages.sendExperiment.bind(this.Pages));
        this.App.post('/delete/:id', this.checkAuthenticated, this.Pages.handelDelete.bind(this.Pages));
        this.App.post('/edit/:id', this.checkAuthenticated, this.Pages.handelDelete.bind(this.Pages));

        this.App.get('/new/experiment', this.checkAuthenticated, this.Pages.sendNewExperiment.bind(this.Pages));
        this.App.post('/new/experiment', this.checkAuthenticated, this.Pages.handleNewExperiment.bind(this.Pages));
        this.App.get('/new/folder', this.checkAuthenticated, this.Pages.sendNewFolder.bind(this.Pages));
        this.App.post('/new/folder', this.checkAuthenticated, this.Pages.handleNewFolder.bind(this.Pages));

        // accounts
        this.App.get('/logout', this.Pages.handleLogout);
        this.App.get('/register', this.checkAuthenticated, this.Pages.sendRegister.bind(this.Pages));
        this.App.get('/login', this.checkNotAuthenticated, this.Pages.sendLogin.bind(this.Pages));

        this.App.post('/register', this.checkAuthenticated, (req, res) => { this.Pages.handleRegister(req, res, this.Database.addUser) });

        this.App.post('/login', this.checkNotAuthenticated, passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }));

        this.App.get('/help', this.Pages.sendHelp.bind(this.Pages));

        this.App.use(this.Pages.handle404.bind(this.Pages));
    }

    private checkAuthenticated(req: express.Request, res: express.Response, next: Function) {
        if (req.isAuthenticated()) {
            next();
        } else {
            if (req.baseUrl === "") {
                res.render('welcome');
            } else {
                res.redirect('/welcome');
            }
        }
    }

    private checkNotAuthenticated(req: express.Request, res: express.Response, next: Function) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        } else {
            next();
        }
    }
}