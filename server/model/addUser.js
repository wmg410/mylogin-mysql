const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
  username:String,
  name:String,
  password:String,
  phone:Number,
  email:String,
  create_time:String,
  is_active:{
    type:Boolean,
    default:false
  }
})

UserSchema.statics = {
  getUserByName:function (name) {
    return new Promise((resolve,reject)=>{
      addUser.findOne({username:name},(err,doc)=>{
        if (err){
          reject(err)
        } else{
          resolve(doc)
        }
      })
    })
  },
  getUserById:function (_id) {
    return new Promise((resolve,reject)=>{
      addUser.findOne({_id},(err,doc)=>{
        if (err){
          reject(err)
        } else{
          resolve(doc)
        }
      })
    })
  }
}

const addUser = mongoose.model('addUser',UserSchema)
module.exports = addUser
