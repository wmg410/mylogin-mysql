<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-menu router @select="handleSelect"
                 :default-active="activeIndex" mode="horizontal" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
          <el-menu-item index="/login" >登录</el-menu-item>
          <el-menu-item index="/register" >注册</el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
    <el-main class="bg-dark">
      <el-row>
        <el-col :span="10" :offset="7">
          <el-form :model="loginForm" :rules="rules" class="loginform" :label-position="'left'" label-width="80px" ref="loginForm">
            <el-form-item label="用户名" prop="username">
              <el-input type="text" v-model="loginForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="loginForm.password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="submitForm('loginForm')">登录</el-button>
              <el-button type="danger" @click="resetForm('loginForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script>
  // 发送请求的文件引入
  import request from '../utils/request'
  export default {
    name: "Login",
    data() {
      let validatorPass = (rule,value,callback)=>{
        // console.log(value);
        // console.log(rule);
        // 密码必须是数字和字母的组合，密码的字符不能是中文和空格，而且长度必须在6-16之间
        let reg = /(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^[^\s\u4e00-\u9fa5]{6,16}$/
        if(!reg.test(value)){
          callback(new Error('密码必须是数字和字母的组合，长度是6-16位'));
        }else{
          callback();
        }
      };

      return {
        activeIndex: "/login",
        loginForm: {
          username: '',
          password: ''
        },
        rules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 6, max: 16, message: '用户名必须在6-16位之间', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {validator: validatorPass, trigger: 'blur'}
          ],
        }
      }
    },
    methods:{
      handleSelect:function (key,keypath) {
        // console.log(keypath);
      },
      // 重置表单数据
      resetForm:function (formName) {
        this.$refs[formName].resetFields();
      },
      // 发送表单数据
      submitForm:function (formName) {
        this.$refs[formName].validate((valid)=>{
          if(valid){
            // 验证成功
            request({
              url:'/api/login',
              method:'post',
              data:this.loginForm
            }).then(({data})=>{
              if(data.success){
                // 登陆成功
                // 1.把token存到cookies或者是sessionstorage/localstorage里面去,用户名也得存进去
                this.$store.dispatch('UserLogin',data.token)
                this.$store.dispatch('UserName',data.username)
                // 2.跳转到首页
                this.$router.push('/')
              }else{
                this.$message.info(data.message)
              }
            }).catch(err=>{
              console.log(err);
            })
          }else{
            return false
          }
        })
      }
    }
  }
</script>

<style scoped type="text/scss">
  .el-row{
    margin-bottom: 20px;
  &:last-child{
     margin-bottom: 0;
   }
  }
  .bg-dark{
    background: #f1f1f1;
  }
</style>
