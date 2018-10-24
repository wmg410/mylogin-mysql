const Router = require('koa-router')
// 子路由
const subRouter = new Router();
const UserController = require('../controller/user')

subRouter.post('/register',UserController.register)
module.exports = subRouter
