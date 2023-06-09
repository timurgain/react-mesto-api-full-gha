require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const prodOrigins = [
  'http://timur.nomoredomains.monster',
  'http://www.timur.nomoredomains.monster',
  'https://timur.nomoredomains.monster',
  'https://www.timur.nomoredomains.monster',
  'http://api.timur.nomoredomains.monster/',
  'https://api.timur.nomoredomains.monster/',
];

const devOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://timur.nomoredomains.monster',
  'http://www.timur.nomoredomains.monster',
  'https://timur.nomoredomains.monster',
  'https://www.timur.nomoredomains.monster',
  'http://api.timur.nomoredomains.monster/',
  'https://api.timur.nomoredomains.monster/',
];

const config = {
  app: {
    port: 3000,
    name: 'express-mesto',
  },
  db: {
    uri: 'mongodb://127.0.0.1:27017/mestodb',
  },
  jwt: {
    secretKey: NODE_ENV === 'production'
      ? JWT_SECRET
      : 'asdasd3esdwq23',
  },
  cors: {
    allowOrigins: NODE_ENV === 'production'
      ? prodOrigins
      : devOrigins,
    allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  },
};

module.exports = config;
