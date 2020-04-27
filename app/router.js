'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt();

  router.get('/yiyan',controller.home.yiyan);
  router.get('/', controller.home.index);
  router.post('/login', controller.user.login);
  router.get('/list',jwt,controller.todo.getList);
  router.get('/test',controller.todo.test);
  router.get('/user',jwt,controller.user.getUser);
  router.post('/sonComplete',jwt,controller.todo.sonComplete);
  router.get('/getTodo',jwt,controller.todo.getTodo);
  router.post('/newTodo',jwt,controller.todo.newtodo);
  router.get('/getCode',jwt,controller.todo.getCode);
  router.get('/loadCode',jwt,controller.todo.loadCode);
  router.post('/fatherJoin',jwt,controller.todo.fatherJoin);
  router.post('/sonJoin',jwt,controller.todo.sonJoin);
};

