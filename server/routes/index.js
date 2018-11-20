const Router = require('koa-router')
// 子路由
const subRouter = new Router();
const UserController = require('../controller/user')
// 服务器判断token是否合法
const checkToken = require('../token/checkToken')
subRouter.post('/register',UserController.register)
subRouter.post('/login',UserController.login)
subRouter.post('/create',UserController.create)
subRouter.post('/updateUser',UserController.updateUser)
subRouter.post('/remove',UserController.remove)
subRouter.post('/deletes',UserController.deletes)
// 他没有权限让服务器给它返回数据
// 如果以后有哪些请求需要登录后才可以得到数据，在路由中加上checkToken
subRouter.get('/home',checkToken,UserController.home)
subRouter.get('/getUsers',checkToken,UserController.getUsers)
module.exports = subRouter
