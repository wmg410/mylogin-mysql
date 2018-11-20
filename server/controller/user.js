// 引入数据库连接文件
const db = require('../model/db')
// 引入User集合
const User = require('../model/User')
const addUser = require('../model/addUser')
// 引入密码加密模块
const sha1 = require('sha1')
// 引入格式化日期的moment模块
const moment = require('moment')
// 引入创建token的方法
const createToken = require('../token/createToken')
// post请求 /register 的处理函数
// 因为这个处理函数需要将用户名，密码写入数据库，所以呢，我们需要在数据库中创建User集合
// 通过controller/user.js这个文件，来对数据库进行增删改查操作.....
const register = async ctx=>{
  // console.log(ctx.request.body);
  let username = ctx.request.body.username;
  let password = ctx.request.body.password;
  // 1.判断数据库是否有同名的的用户，如果存在，则不允许注册
  // 2.需要验证下数据的合法性---- validation验证，也可以不验证，保险的话，前端验完，后端再验一次
  // 3.注册的时候都需要对时间进行格式化
  // 4.将注册的用户的信息保存在数据库中
  // 5.生成token，将成功的注册信息以及token放回给前端
  let doc = await User.getUserByName(username);
  console.log(doc);
  if (doc) {
    // 说明数据库中有重名的用户
    // 直接返回一个对象，提醒用户名不允许重复
    ctx.status = 200;
    ctx.body = {
      success:false,
      message:'用户名不允许重复'
    }
  }else{
    // 说明数据库里面没有重名的用户
    // 可以放心注册了
    // 这里一般为了安全，还会对username/password进行二次验证
    // 为了节省时间，我就不验证了，可以利用node里面的一个模块可以很方便的进行验证 --- validation模块

    // 也可以使用crypto模块-node原生的加密模块进行加密
    password = sha1(password);
    let date = new Date();
    let create_time = moment(date).format('YYY-MM-DD HH:mm:ss')  // 当前时间就被格式化为年月日、时分秒了
    // 生成token
    let token = createToken(username)
    // 创建新用户
    let newUser = new User({
      username,
      password,
      token,
      create_time
    })
    // 将新用户保存到User集合里面
    let userInfo = await new Promise((resolve,reject) =>{
     newUser.save((err,doc)=>{
       if (err){
         reject(err)
       }
       resolve(doc)
     })
    })
    ctx.status = 200;
    ctx.body = {
      success:true,
      message:'注册成功',
      data:userInfo    // 有些网站是注册后就直接登陆了，所以，这里，把用户的信息也返回了，就是为了兼容那些注册后就直接登陆的网站。
    }
  }
}

// 登录逻辑
const login = async ctx=>{
  // 1.检查用户名是否存在
  // 2.检查密码是否正确
  // 3.生成token，将token返回给前端，用户登录后token就保留到了客户端了
  // 每次请求的时候我们都会让用户带着token来访问服务器，服务器呢，通过判断token，来确认用户是否是登录状态
  // 例如某些需要登陆后才能访问的页面，就可以用这个实现权限管理了
  let username = ctx.request.body.username;
  let password = ctx.request.body.password;
  let doc = await User.getUserByName(username);
  if (doc){
    // 用户名存在
    if(doc.password == sha1(password)){
      // 密码一样
      let token = createToken(username);
      // 赋值给doc一个新的token值
      doc.token = token;
      // 重新保存一下doc
      await new Promise((resolve,reject) =>{
        doc.save((err,doc)=>{
          if(err){
            reject(err)
          }else{
            resolve()
          }
        })
      })
      ctx.status = 200;
      ctx.body = {
        success:true,
        message:'登陆成功',
        token:doc.token,   // 用户的token信息
        username:doc.username // 登录的用户名
        // 如果有头像的话，也可以将用户的头像信息返回
      }
    }else{
      // 密码不一样
      ctx.status = 200;
      ctx.body = {
        success:false,
        message:'密码错误，请重新输入'
      }
    }
  } else{
    // 用户名不存在
    ctx.status = 200;
    ctx.body = {
      success:false,
      message:'用户名不存在'
    }
  }
}

// 新增表单
const create = async ctx=>{
  let doc = await addUser.getUserByName(ctx.request.body.username);
  // console.log(doc);
  if (doc) {
    // 说明数据库中有重名的用户
    // 直接返回一个对象，提醒用户名不允许重复
    ctx.status = 200;
    ctx.body = {
      success:false,
      message:'用户名不允许重复'
    }
  }else {
    ctx.request.body.create_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')  //
    let username = ctx.request.body;
    let user = new addUser(username);
    let UserInfo = await new Promise((resolve, reject) => {
      user.save((err, doc) => {
        if (err) {
          reject(err)
        }else{
          resolve(doc)
        }
      })
    })
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "添加成功"
    }
  }
}
// 分页
const getUsers = async ctx=> {
  let page = ctx.request.query.page * 1 - 1;
  let pageSize = ctx.request.query.pageSize * 1
  let total = await new Promise((resolve, reject) => {
    addUser.find().countDocuments().exec((err, doc) => {
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
  let getInfo = await new Promise((resolve, reject) => {
    addUser.find().sort({'create_time': -1}).skip(page * 5).limit(pageSize).exec((err, doc) => {
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
  // console.log(getInfo,total,page,pageSize)
  ctx.status = 200;
  ctx.body = {
    success: true,
    data: getInfo,
    total: total
  }
}
// 编辑
const updateUser = async ctx=>{
  let updateInfo = await new Promise((resolve, reject) => {
    addUser.findOne({_id:ctx.request.body._id},(err,doc) => {
      // console.log(doc,ctx.request.body)
      doc.name = ctx.request.body.name;
      doc.phone = ctx.request.body.phone;
      doc.email = ctx.request.body.email;
      doc.is_active = ctx.request.body.is_active;
      doc.save((err,doc)=>{
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  })
  ctx.status = 200;
  ctx.body = {
    success: true,
    data: updateInfo
  }
}
// 操作删除
const remove = async ctx=>{
  // console.log(ctx.request.body)
  let removeInfo = await new Promise((resolve, reject) => {
    addUser.remove({_id:ctx.request.body._id},(err,doc)=>{
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
  ctx.status = 200;
  ctx.body = {
    success: true
  }
}
// 删除
const deletes = async ctx=>{
  let Data = ctx.request.body;
  await Data.forEach(async (data)=>{
    console.log(data)
    await new Promise((resolve,reject)=>{
      addUser.deleteOne({_id:data._id},(err,doc)=>{
        if(err){
          reject(err)
        }else{
          resolve(doc)
        }
      })
    })
  })
  ctx.status = 200;
  ctx.body = {
    success: true
  }
}

// 首页业务逻辑
// const home =async ctx=>{
//   ctx.body = '你要的是不是这个';
// }

// 暴露出一个register方法
module.exports = {
  register,
  login,
  home,
  create,
  getUsers,
  updateUser,
  remove,
  deletes
}

