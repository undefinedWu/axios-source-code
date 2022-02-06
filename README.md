# axios-source-code

> axios 是一个基于 promise 的 http 库，它同时支持 browser 和 nodejs 环境

## 基本知识点

1. 实际上我们使用得是一个 axios 实例,当然也可以使用 axios.create(config)创建一个实例。（**这样就可以有一些扩展，比如：在使用得当前库得时候想有一些全局得值，在一些第三方库中也有体现 redux-thunk**）

```js
// axios.js文件

// Axios实例构造函数
import Axios from "core/Axios.js";
// 默认配置文件
import defaults from "default.js";

function createInstance(defaultConfig) {
    const instance = new Axios(defaultConfig);

    // 一些需要做的事情 比如可以直接使用instance.get(config)等来发送请求

    // 添加create方法
    instance.create = function (config) {
        // merge方法就是用来和并配置得 这地方书写比较复杂 嵌套合并
        return createInstance(merge(defaultConfig, config));
    };

    return instance;
}

const instance = createInstance(defaults);
```

2. Axios 构造函数

```js
function Axios(config) {
    // 保存配置
    this.defaults = config;
    // 拦截器
    // 拦截器都是通过 use 方法来进行添加得
    // 所有在内部实现上 实例维护一个数组 存储对应得函数
    this.interceptor = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    };
}
// Axios得prototype上有一个request函数
Axios.prototype.request = function (url, config) {
    // 这是所有请求发出得接口函数！！！！

    /*
    1. 合并url到config中
    2. 合并配置 merge(this.defaults, config)
    3. 确定请求方法
    4. 确定返回得promise
    */

    return new Promise(resolve => {});
};
// 原型上有各种请求方法
["delete", "get", "head", "option"].forEach(method => {
    Axios.prototype[method] = function (url, config) {
        // 请求体放在config中data属性
        // 最终会调用原型上的request方法
    };
});
["post", "patch", "put"].forEach(method => {
    Axios.prototype[method] = function (url, data, config) {
        // 请求体作为第二个参数
        // 最终会调用原型上得request方法
    };
});

function InterceptorManager() {
    this.handler = [];
}

/**
 * @param {Function} success 成功函数 需要返回配置
 * @param {Function} fail 失败函数
 * @param {object} options 配置对象
 *      @synchronous {boolean} 同步？？？
 *      @runWhen {Function} 函数调用传入配置对象config 如果返回false 那么当前拦截器不会加入到拦截器队列中
 *
 */
InterceptorManager.prototype.use = function (success, fail, options) {};
```

1. 发送一个请求的过程

1. 取消请求的原理

1. 防 xsrf 原理

1. axios.spread

1. 一些基本的配置

1. 封装 axios
