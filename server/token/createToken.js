const jwt = require('jsonwebtoken')
module.exports = function (user_id) {
  const token = jwt.sign({
    user_id:user_id    // 使用用户名字符串作为token的凭证
  },'secret',{
    expiresIn:'300s'
  })
  // secret是加密的迷药，验证的时候会用到
  return token;
}
