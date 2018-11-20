<template xmlns:el-col="http://www.w3.org/1999/html">
  <!--组件必须有一个根元素 所以在写组件内容的时候 一定得记得加个div-->
    <div>
      <el-container>
        <el-header>
          <h1>Vue + Node CURD增删改查项目</h1>
        </el-header>
        <el-main>
          <el-row>
            <el-col :span="20" :offset="1">
              <div class="fr margin40">
                <el-button size="mini" type="primary" icon="el-icon-plus" @click="addDialog = true">添加</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteButton">删除</el-button>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-table :data="userList" style="width: 100%" :default-sort="{prop:'create_time',order:'descending'}" @selection-change="selectionButton">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="username" label="用户名">
                </el-table-column>
                <el-table-column prop="name" label="姓名" sortable>
                </el-table-column>
                <el-table-column prop="phone" label="手机">
                </el-table-column>
                <el-table-column prop="email" label="邮箱">
                </el-table-column>
                <el-table-column prop="create_time" label="注册日期" sortable>
                </el-table-column>
                <el-table-column prop="is_active" label="状态" width="75">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.is_active?'success':'danger'">
                      <span v-if="scope.row.is_active">启用</span>
                      <span v-else>停用</span>
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="250">
                  <template slot-scope="scope">
                    <el-button type="success"size="small" @click="setUser(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteUser(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <div class="block">
                <el-pagination layout="prev,pager,next" :total="total" :page-size="5" @current-change="pageChange">
                </el-pagination>
              </div>
            </el-col>
          </el-row>
        </el-main>
      </el-container>

      <el-dialog title="添加新用户" :visible.sync="addDialog">
        <el-form :model="addForm" label-width="100px" :rules="addRules" ref="addForm">
          <el-form-item label="用户名" prop="username">
            <el-input type="text" v-model="addForm.username" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input type="text" v-model="addForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addForm.password" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPassword">
            <el-input type="password" v-model="addForm.checkPassword" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input type="text" v-model.number="addForm.phone" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input type="text" v-model="addForm.email" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="是否启用">
            <el-switch v-model="addForm.is_active"></el-switch>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('addForm')">提交</el-button>
            <el-button @click="resetForm('addForm')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <el-dialog title="修改用户" :visible.sync="editDialog">
        <el-form :model="editForm" :rules="addRules" ref="editForm" label-width="100px">
          <el-form-item label="姓名" prop="name">
            <el-input type="text" v-model="editForm.name">
            </el-input>
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input type="text" v-model="editForm.phone">
            </el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input type="text" v-model="editForm.email">
            </el-input>
          </el-form-item>
          <el-form-item label="是否启用" prop="is_active">
            <el-switch v-model="editForm.is_active">
            </el-switch>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateUser">修改</el-button>
            <el-button @click="resetForm('editForm')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
</template>

<script>
  import request from '../utils/request';
  export default {
    name: "Home",
    // 组件挂载完毕的时候发个请求，请求服务器的数据
    mounted(){
      this.getUsers();
    },
    data(){
      // 姓名的验证
      let validatorName = (rule,value,callback)=>{
        let reg =  /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,
       }$/
        if(!reg.test(value)){
          callback(new Error('姓名必须是中文'));
        }else{
          callback();
        }
      }
      // 第一次输入密码的自定义验证规则
      let validatorPass1 = (rule,value,callback)=>{
        // 密码必须是数字和字母的组合，密码的字符不能是中文和空格，而且长度必须在6-16之间
        let reg = /(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^[^\s\u4e00-\u9fa5]{6,16}$/
        if(!reg.test(value)){
          callback(new Error('密码必须是数字和字母的组合，长度是6-16位'));
        }else{
          callback();
        }
      };
      // 第二次输入密码的时候
      let validatorPass2 = (rule,value,callback)=>{
        if(value !== this.addForm.password){
          callback(new Error('两次密码不一致，请重新输入'));
        }else{
          callback();
        }
      };
      // 手机号码的验证
      let validatorPhone = (rule,value,callback)=>{
        let reg = /^1[34578]\d{9}$/
        if (!reg.test(value)){
          callback(new Error('手机号码格式错误，请重新输入'));
        }else{
          callback();
        }
      };
      // 邮箱的验证
      let validatorEmail = (rule,value,callback)=>{
        let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
        if(!reg.test(value)){
          callback(new Error('邮箱格式错误，请重新输入'))
        }else{
          callback();
        }
      }

      return{
        // 新增的表单数据
        addForm:{
          username:'',
          name:'',
          password:'',
          checkPassword:'',
          phone:'',
          email:'',
          is_active:false
        },
        editForm:{
          "_id":'',
          "name":'r',
          "phone":'',
          "email":'',
          "is_active":null
        },
        // 添加的对话框
        addDialog:false,
        editDialog:false,
        userList:[],
        addRules:{
          // 用户名的验证规则
          username:[
            {required:true,message:'请输入用户名',trigger:'blur'},
            {min:6,max:16,message:'用户名必须在6-16位之间',trigger:'blur'}
          ],
          // 姓名的验证规则
          name:[
            {required:true,message:'请输入姓名',trigger:'blur'},
            {validator:validatorName,trigger:'blur'}
          ],
          // 密码的验证规则
          password:[
            {required:true,message:'请输入密码',trigger:'blur'},
            // 自定义的验证规则
            {validator:validatorPass1,trigger:'blur'}
          ],
          // 确认密码的验证规则
          checkPassword:[
            {required:true,message:'请输入确认密码',trigger:'blur'},
            {validator:validatorPass2,trigger:'blur'}
          ],
          // 手机的验证
          phone:[
            {required:true,message:'请输入手机号码',trigger: 'blur'},
            {validator:validatorPhone,trigger:'blur'}
          ],
          // 邮箱的验证
          email:[
            {type:'email',required:true,message:'请输入邮箱',trigger:'blur'},
            {validator:validatorEmail,trigger:'blur'}
          ]
        },
        total:0,
        multipleSelection:[]
      }
    },
    methods:{
      // 表单提交
      submitForm:function(formName){
        this.$refs[formName].validate((valid)=>{
          if(valid){
            request({
              url:'/api/create',
              method:'post',
              data:this.addForm
            }).then(({data})=>{
              if(data.success){
                this.$message.success('新增用户成功');
                this.resetForm('addForm');
                this.getUsers();
              }else{
                this.$message.error(data.message);
              }
            }).catch(err=>{
              console.log(err)
            })
          }else{
            return false
          }
        })
      },
      // 弹出框得取消按钮
      resetForm:function(formName){
        if(formName == 'addForm'){
          this.addDialog = false
        }else if(formName == 'editForm'){
          this.editDialog = false
        }
        this.$refs[formName].resetFields();
      },
      getUsers:function(page){
        request({
          url:'/api/getUsers',
          method:'get',
          params:{
            page: page || 1,
            pageSize:5
          }
        }).then(({data})=>{
          // console.log()
          this.userList = data.data;
          this.total = data.total;
        }).catch(err=>{
          console.log(err)
        })
      },
      pageChange:function(value){
        this.getUsers(value);
      },
      setUser:function(row){
        this.editDialog = true;
        this.editForm._id = row._id;
        this.editForm.name = row.name;
        this.editForm.phone = row.phone;
        this.editForm.email = row.email;
        this.editForm.is_active = row.is_active;
      },
      updateUser:function(){
        request({
          url:'/api/updateUser',
          method:'post',
          data:this.editForm
        }).then(({data})=>{
          if(data.success){
            this.$message.success('修改成功');
            this.resetForm('editForm');
            this.getUsers();
          }
        }).catch(err=>{
          console.log(err)
        })
      },
      deleteUser:function(row){
        this.$confirm('此操作将永远删除用户'+ row.username + ',是否继续？','提示',{
          confirmButtonText:'确定',
          cancelButtonText:'取消',
          type:'warning'
        }).then(()=>{
          request({
            url:'/api/remove',
            method:'post',
            data:row
          }).then(({data})=>{
            this.$message.success('删除成功');
            this.getUsers()
          }).catch(err=>{
            console.log(err)
          })
        }).catch(()=>{
          this.$message({
            type:'info',
            message:'已取消删除'
          })
        })
      },
      selectionButton:function(val){
        this.multipleSelection = val
      },
      deleteButton:function(){
        this.$confirm('此操作将永远删除文件，是否继续？','提示',{
          confirmButtonText:'确定',
          cancelButtonText:'取消',
          type:'warning'
        }).then(()=>{
          request({
            url:'/api/deletes',
            method:'post',
            data:this.multipleSelection
          }).then(({data})=>{
            this.$message.success('删除成功');
            this.getUsers();
          }).catch(err=>{
            console.log(err)
          })
        }).catch(()=>{
          this.$message({
            type:'info',
            message:'已取消删除'
          })
        })
      }
    }
  }
</script>

<style scoped>
  h1{
    text-align: center;
  }
  .clearfix{
    clear: both;
  }
  .fr{
    margin-top: 40px;
    float: right;
  }
  .block{
    margin-top: 20px;
    float: right;
  }
</style>
