import axios from "axios";

const { CancelToken } = axios;
const source = CancelToken.source();
console.log(source);
// import InterceptorManager from "axios/lib/core/InterceptorManager";

// console.log(axios.defaults.headers);

// // 实际上我们导入得是一个实例
// axios.get("localhost:8080", {
//     data: {}
// });

axios.interceptors.request.use(
    config => {
        console.log("------->", config.headers);
        return config;
    },
    error => Promise.reject(error)
);

// axios.post("localhost:8080", {}, {});
// const request = new InterceptorManager();

// 返回一个id => 在数组中得索引
// const id = request.use(() => {
//     console.log("fn1");
// });
// request.use(() => {
//     console.log("fn2");
// });
// // 取消使用当前拦截器
// request.eject(id);

// axios.get("www.baidu.com");
