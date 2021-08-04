import cookieParser from 'cookie-parser';
import express from 'express';
import flash from 'express-flash';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import { CAPI } from "./CAPI";
import { CConfig } from './CConfig';
import { CDatabase } from './CDatabase';
import { CPages } from './CPages';
import { CPassportConfig } from './CPassportConfig';
import { CStorage } from './CStorage';

export class CWebserver {
    private App: express.Express;
    private Pages: CPages;
    private Config: CConfig;
    private API: CAPI
    private PassportConfig: CPassportConfig;

    constructor(database: CDatabase, config: CConfig) {
        const storage = new CStorage(`${__dirname}/data`); // make dynamic

        this.App = express();
        this.Config = config;
        this.Pages = new CPages(this.Config.version, database, storage);
        this.API = new CAPI(this.Pages, database, storage);
        this.PassportConfig = new CPassportConfig(
            passport,
            database.getUserByName.bind(database),
            database.getUserById.bind(database)
        );


        this.intiExpress();
    }

    private intiExpress() {
        this.App.set('view engine', 'ejs');
        if (this.Config.settings.loglevel >= 4) { this.App.use(morgan('dev')); }
        this.App.use(express.static('public'));
        this.App.use(express.urlencoded({ extended: false, limit: '1kb' }));
        this.App.use(express.json({ limit: '1kb' }));
        this.App.use(cookieParser());
        this.App.use(flash());
        this.App.use(session({ secret: this.Config.server.sessionSecret, resave: false, saveUninitialized: false }));
        this.App.use(passport.initialize());
        this.App.use(passport.session());
        this.App.listen(this.Config.server.port);
    }

    public async initPagelisteners() {
        // Request handles
        this.App.get('/', this.checkAuthenticated, this.Pages.sendIndex.bind(this.Pages));
        this.App.get('/welcome', this.checkNotAuthenticated, this.Pages.sendWelcome.bind(this.Pages));
        this.App.get('/selection', this.checkAuthenticated, this.Pages.sendSelection.bind(this.Pages));
        this.App.get('/selection/:id', this.checkAuthenticated, this.Pages.sendSelection.bind(this.Pages));
        this.App.get('/experiment/:id', this.checkAuthenticated, this.Pages.sendExperiment.bind(this.Pages));
        this.App.get('/help', this.Pages.sendHelp.bind(this.Pages));

        // editor & api
        this.App.get('/editor/:id', this.checkAuthenticated, this.checkCanEdit, this.Pages.sendEditor.bind(this.Pages));
        this.App.get('/api/new/folder', this.checkAuthenticated, this.checkCanEdit, this.API.createFolder.bind(this.API))
        this.App.post('/api/new/experiment', this.checkAuthenticated, this.checkCanEdit, this.API.createExperiment.bind(this.API))
        this.App.get('/api/edit/selection/:folder', this.checkAuthenticated, this.checkCanEdit, this.API.renameFolder.bind(this.API))
        this.App.get('/api/edit/experiment/:experiment', this.checkAuthenticated, this.checkCanEdit, this.API.renameExperiment.bind(this.API))
        this.App.get('/api/delete/selection/:folder', this.checkAuthenticated, this.checkCanEdit, this.API.deleteFolder.bind(this.API))
        this.App.get('/api/delete/experiment/:experiment', this.checkAuthenticated, this.checkCanEdit, this.API.deleteExperiment.bind(this.API))



        // accounts
        this.App.get('/logout', this.Pages.handleLogout);
        this.App.get('/login', this.checkNotAuthenticated, this.Pages.sendLogin.bind(this.Pages));
        this.App.post('/login', this.checkNotAuthenticated, passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }));

        this.App.get('/404', this.Pages.handle404.bind(this.Pages));
        this.App.use((req: express.Request, res: express.Response) => {
            res.redirect('/404');
        });
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

    private checkCanEdit(req: express.Request, res: express.Response, next: Function) {
        // @ts-ignore
        if (req.user.CanEdit) {
            next();
        } else {
            res.redirect('/404')
        }
    }

    private checkIsAdmin(req: express.Request, res: express.Response, next: Function) {
        // @ts-ignore
        if (req.user.IsAdmin) {
            next();
        } else {
            res.redirect('/404')
        }
    }
}