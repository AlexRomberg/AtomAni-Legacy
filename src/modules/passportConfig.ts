const LocalStrategy = require('passport-local').Strategy;
import bcrypt from 'bcrypt';

function initialize(passport: any, getUserByLoginName: Function, getUserById: Function) {
    const authenticateUser = async (userId: string, password: string, done: Function) => {
        const usernameParams = userId.split('|');
        const organisation = usernameParams.shift();
        const username = usernameParams.join('|');

        const user = getUserByLoginName(username, organisation);

        if (user == null) {
            return done(null, false, { message: 'No user with that email' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user: any, done: Function) => done(null, user.id));
    passport.deserializeUser((id: string, done: Function) => {
        return done(null, getUserById(id));
    });
}

module.exports = initialize;