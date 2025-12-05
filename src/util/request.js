import axios from 'axios'
//创建axios实例对象
const request = axios.create({
    baseURL:'/api',
    timeout:60000
})
//axios的响应response拦截器
request.interceptors.response.use(
    (response)=>{//成功回调
        return response.data
    },
    (error)=>{//失败回调
        return Promise.reject(error)
    }
)
export default request