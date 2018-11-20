// 全局的变量
const state = {
  // 全局的数据
  token:window.sessionStorage.getItem('token'),   // 通过sessionStorage村token，这个方法是获取到token的值
  username:''
}
export default state
