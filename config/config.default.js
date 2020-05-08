/* eslint valid-jsdoc: "off" */

'use strict';
const fs = require('fs');
const path = require('path');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1586629238677_2197';

  // add your middleware config here
  config.middleware = [];
  config.cluster = {
    listen: {
      path: '',
      port: 80,
      hostname: '0.0.0.0',
    }
  };
  config.mysql = {
    client: {
      host: '127.0.0.1',
      port: '3306',
      user: 'root',
      password: 'root',
      database: 'blessingtodo',
    },
    app: true,
    agent: false,
  };
  let cert = fs.readFileSync(path.resolve(__dirname,'../app/jwt.pem'));
  config.jwt = {
    secret: cert,
  };
  config.security = {
    csrf:{
      enable: false
    }
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    wechatappid: "",
    wechatsecret: "",
    api: "https://domain/api.php"
  };
  return {
    ...config,
    ...userConfig,
  };
};
