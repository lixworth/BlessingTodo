'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt();

  router.get('/', controller.home.index);
  router.post('/login', controller.user.login);
  router.get('/list',jwt,controller.todo.getList);
};
