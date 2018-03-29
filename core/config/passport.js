import { Strategy as JWTStrategy } from 'passport-jwt';
import jwt from 'jsonwebtoken';

import config from './config.dev';
import User from '../../models/user';

export default (passport) => {
  const opts = {};
  opts.jwtFromRequest = (req) => {
    let token = jwt.sign({ id: 0 }, config.JWT_SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });
    const field = req && req.headers.authorization;
    if (field && field.startsWith('JWT ')) {
      token = field.slice(4);
    }

    return token;
  };
  opts.secretOrKey = config.JWT_SECRET;
  opts.passReqToCallback = true;

  passport.use(new JWTStrategy(opts, (req, payload, done) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const ipFormat = /192\.168\.0\.213$/;
    if (ipFormat.test(ip)) {
      return done(null, true);
    }

    if (payload.id === 0) {
      return done(null, false);
    }

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
