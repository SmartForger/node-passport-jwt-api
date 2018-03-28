import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import config from './config.dev';
import User from '../../models/user';

export default (passport) => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = config.JWT_SECRET;

  passport.use(new JWTStrategy(opts, (payload, done) => {
    console.log(payload.id);
    User.findById(payload.id, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      }

      console.log(err, user);
      return done(null, false);
    });
  }));
};
