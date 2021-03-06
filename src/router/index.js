import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
//这种是默认的加载组件的方式 ，所有的组件都会被扔到app.js这个文件中， 当组件过多的时候， app文件就会非常大。 所以呢 推荐使用require.ensure路由懒加载

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
const router = new Router({
  //去掉访问的时候的/#这个动态参数
  mode:'history',
  //路由规则
  routes: [
    {
      path:'/',
      component:Home, //如果用户访问的是首页的话 那么我们就让他加载home组件
      // 在需要权限的页面路由中，添加一个requireAuth字段,写在meta里面
      meta:{
        requiresAuth:true
      }
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
// 路由在跳转的时候都会先执行这个代码
router.beforeEach((to,from,next)=> {
  // 获取token
  let token = store.state.token;
  if (to.meta.requiresAuth) {
    // 是否是需要权限的页面
    if (token){
      next()   // token存在，则让它通过
    } else {
      // token不存在，不让他通过，让它跳转到登录页面
      next({
        path: '/login'
      })
    }
  }else{
    // 不需要权限的页面
    next()
  }
})

//暴露了一个路由对象
export default router
