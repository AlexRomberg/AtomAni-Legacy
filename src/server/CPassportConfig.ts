import passport from 'passport';
import bcrypt from 'bcrypt';
import passportLocal from 'passport-local';

export class CPassportConfig {
    private Passport: passport.PassportStatic;
    private GetUserByLoginName: Function;
    private GetUserById: Function;
    private LocalStrategy: any;


    constructor(passport: passport.PassportStatic, getUserByLoginName: Function, getUserById: Function) {
        this.Passport = passport;
        this.GetUserByLoginName = getUserByLoginName;
        this.GetUserById = getUserById;

        this.LocalStrategy = passportLocal.Strategy;


        this.Passport.use(new this.LocalStrategy({ usernameField: 'username' }, this.authenticateUser.bind(this)));
        this.Passport.serializeUser((user: any, done: Function) => done(null, user.id));
        this.Passport.deserializeUser(async (id: string, done: Function) => {
            done(null, this.convertUser(await this.GetUserById(id)));
        });
    }

    public async authenticateUser(userId: string, password: string, done: Function) {
        const usernameParams = userId.split('|');
        const organisation = usernameParams.shift();
        const username = usernameParams.join('|');

        try {
            const user = this.convertUser(await this.GetUserByLoginName(username, organisation));

            if (user === null) {
                // return done(null, false, { message: 'username, password or organisation incorrect' });
                return done(null, false, { message: 'user not found' });
            }

            try {
                if (bcrypt.compareSync(password, user.password)) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'password incorrect' });
                    // return done(null, false, { message: 'username, password or organisation incorrect' });
                }
            } catch (err) {
                return done(err);
            }
        } catch (err) {
            return done(err);
        }
    }

    private convertUser(user: { UserId: string; UserIdentification: string; UserName: string; UserPW: string; UserImage: string; UserCanEdit: boolean; UserIsAdmin: boolean; OrgId: string }): { id: string; loginName: string; name: string; password: string; image: string; CanEdit: boolean; IsAdmin: boolean; OrgId: string } {
        try {
            return {
                id: user.UserId,
                loginName: user.UserIdentification,
                name: user.UserName,
                password: user.UserPW,
                image: user.UserImage,
                CanEdit: user.UserCanEdit,
                IsAdmin: user.UserIsAdmin,
                OrgId: user.OrgId
            };
        } catch (err) {
            throw err;
        }
    }
}
