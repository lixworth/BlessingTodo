// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportJwt = require('../../../app/middleware/jwt');

declare module 'egg' {
  interface IMiddleware {
    jwt: typeof ExportJwt;
  }
}
