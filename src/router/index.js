import Vue from 'vue'
import Router from 'vue-router'
//这种是默认的加载组件的方式 所有的组件都会被扔到app.js这个文件中 当组件过多的时候 app文件就会过大 所以呢 推荐使用require.ensure路由懒加载

const Login = resolve=>{
        require.ensure(['pages/Login.vue'],()=>{
    resolve(require('pages/Login.vue'));
  })
}
const Register = resolve=>{
  require.ensure(['pages/Register.vue'],()=>{
    resolve(require('pages/Register.vue'));
  })
}
const Home = resolve=>{
  require.ensure(['pages/Home.vue'],()=>{
    resolve(require('pages/Home.vue'));
  })
}
const Error = resolve=>{
  require.ensure(['pages/404.vue'],()=>{
    resolve(require('pages/404.vue'));
  })
}




//引入home login register 404组件
// import Home from 'pages/Home'
// import Login from 'pages/Login'
// import Register from 'pages/Register'
// import Error from 'pages/404'




//让路由规则生效
Vue.use(Router)
//暴露了一个路由对象
export default new Router({
  //去掉访问的时候的/#这个动态参数
  mode:'history',
  //路由规则
  routes: [
    {
      path:'/',
      component:Home //如果用户访问的是首页的话 那么我们就让他加载home组件
    },
    {
      path:'/login',
      component:Login
    },
    {
      path:'/register',
      component:Register
    },
    {
      path:'*',
      component:Error
    }
  ]
})
