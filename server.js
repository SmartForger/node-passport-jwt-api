import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';

import logger from './core/logger/app-logger';
import config from './core/config/config.dev';
import passportConfig from './core/config/passport';
import cars from './routes/cars.route';
import auth from './routes/auth.route';
import connectToDb from './db/connect';

const port = config.serverPort;
logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

connectToDb();

const app = express();

passportConfig(passport);
app.use(passport.initialize());

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev', { stream: logger.stream }));


app.use('/cars', cars);
app.use('/auth', auth);
app.get(
  '/test',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send('Protected resource');
  },
);
app.get(
  '/secretDebug',
  (req, res, next) => {
    console.log(req.get('Authorization'));
    next();
  }, (req, res) => {
    res.json('debugging');
  },
);

// Index route
app.get('/', (req, res) => {
  res.send('Node API');
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(err.status || 500).send(err);
  } else {
    next();
  }
});

app.listen(port, () => {
  logger.info('server started - ', port);
});
