> Axios 是一个基于 promise 的 http 库，同时可以支持 node 和浏览器环境

## 创建 axios 实例的过程

```js
// Axios.js
function Axios(config) {
    this.defaults = config;
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    };
}

// axios.js
function createInstance(defaultConfig) {
    const conext = new Axios(defaultConfig);

    const instance = bind(conext.prototype.request, context);

    // 将一些在context上的属性复制到instance上 context的原型和context实例本身属性
    extend(instance, conext.prototype, context);
    extend(instance, conext);

    // 添加上create方法
    instance.create = function (instanceConfig) {
        // 合并配置
        const combinedConfig = merge(defaultConfig, instanceConfig);
        // 返回一个新的实例
        return createInstance(combinedConfig);
    };
}

const axios = createInstance(config);

module.exports = axios;
```

![image-20220215114356486.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bf16686ba99145f99bd4a058ac10ea2f~tplv-k3u1fbpfcp-watermark.image?)

借助 Axios 类构建一个实例，通过包装原型链上的 request 方法，得到一个被“包装”的函数（**本质就是调用 request 函数**），该“包装”函数有克隆了 Axios 实例和原型上的一些属性和方法，并添加了 create 方法，最终进行导出。

## 调用请求的过程

1. 拦截器的实现

```js
// interceptorManager.js
function InterceptorManager() {
    // 维护一个自己的队列
    this.handlers = [];
}

Interceptor.prototype.use = function (onResolved, onReject, options) {
    this.handlers.push({
        fulfilled: onResolved,
        onRejected: onRject,
        // 此属性最终会决定 当前请求的调用过程是异步的还是同步的 --> 阻塞性
        synchronous: options.synchronous || false,
        // 当前属性是一个函数 调用的时候传递config 如果最终返回false就不会将当前拦截器加入到队列中
        runWhen: options.runWhen
    });
    // 返回在handlers中对应的位置 用于取消使用拦截器
    return id;
};
//...省略部分代码
```

2. 请求过程

```js
// Axios.js
// 当前函数 是所有请求方法调用的接口
Axios.prototype.request = function (url, config) {
    // 会对配置对象中的一些东西进行处理 比如将url合并到config中、判定请求方法等

    // 最终返回的promise
    let promise;
    // 构建队列 请求拦截器
    const requestInterceptorChain = [];
    let sync = true;
    // InterceptorManager原型上实现的方法
    this.interceptors.request.forEach(function (interceptor) {
        const {runWhen, synchronous, fulfilled, onRejected} = interceptor
        // 先判断当前拦截是否需要加入到队列中
        if (runWhen && !runWhen(config)) {
               // 直接结束
               return;
        )
        // 用于决定最终是同步还是异步
        sync = sync && synchronous;
        requestInceptorChain.unshift(fullfilled, onRejected);
    })

    // 构建队列 响应拦截器
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function (interceptor) {
        const {fulfilled, onRejected} = interceptor;
        responseInterceptorChain.unshift(fulfilled, onRejected);
    })
    // 此时就会所有的都放在promise中进行执行
    if (!sync) {
        // 第二项是undefined主要就是用于区分请求和响应拦截 第一项就是对应的请求函数
        let chain = [dispatchRequest, undefined];
        // 头部插入请求拦截器
        Array.prototype.unshift.call(chain, requestInceptorChain);
        // 尾插响应拦截器
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);

        while(chain.length !== 0) {
            const fulfilled = chain.shift();
            const onRejected = chain.shift();
            // 此时请求拦截都是变成异步 不会阻塞后面其它代码的执行
            promise.then(fulfilled, onRejected);
        }

        return promise;
    }

    // 是同步的形式
    // 处理请求拦截器
    let newConfig = config;
    while (requestInterceptorChain.length) {
        const onFulfilled = requestInterceptorChain.shift();
        const onRejected = requestInterceptorChain.shift();
        try {
            newConfig =onFulfilled(newConfig);
        } catch(err) {
            onRejected(err);
            break;
        }
    }
    // 处理请求
    try {
        promise = dispatchRequest(newConfig);
    } catch(err) {
        // 直接rejected
        return Promise.reject(err);
    }
    // 处理响应拦截器
    while (responseInterceptorChain.length) {
        const onFulfilled = responseInterceptorChain.shift();
        const onRejected = responseInterceptorChain.shift();
        promise.then(onFulfilled, onRejected)
    }

    return promise;
}
```

3. 触发请求：
   在 config 中存在一个默认的配置项 adapter，在创建实例的时候，就会根据所在的环境进行选择对应的发送请求的函数（**函数最终会返回一个 promise**）

```js
// dispatchRequest.js
function dispatchRequest(config) {
    // 进行一些处理：头部数据格式（headers、data）处理（config.transfromRequest），头部压缩（原本被加入了一些东西）等
    adapter(config).then(response => {
        // 对响应的数据进行转换成指定格式(config.transformResponse) config中responseType属性决定最终的数据类型
    });
}
```

![image-20220213184155932.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc1110c140de41788d66c09bcb0e944b~tplv-k3u1fbpfcp-watermark.image?)

## 取消请求

### 原生的 http 请求取消

```js
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function (e) {
    // console.log(e, xhr.readyState)
    if (this.readyState === 4 && xhr.status === 200) {
        console.log(xhr); // 对象中包含一些关于请求的信息
    }
};
// 监听调用了abort函数
xhr.onabort = function (e) {
    console.log("请求被手动取消了", e);
};
xhr.open("get", 一个可以测试的接口);
xhr.send("我来测试一下");
// 取消请求 此时我们可以在控制台的network中看到被取消的请求
xhr.abort();
```

### axios 中的取消请求

假设我们在 config 中配置了 cancelToken 这个属性，我们就可以在发送请求之前，在 CancelToken 实例中去订阅一个函数（当前函数需要做两件事：**1. 当前请求对应的 promise 的状态设置为 rejected; 2. 将请求取消掉**）。`所以现在需要确定什么时候去调用在cancelToken中订阅的函数`。在 axios 中实现是，在创建 CancelToken 实例的时候也对外暴露一个 cancel 函数，供用户去调用。

```js
// CancelToken.js
function CancelToken(excutor) {
    // 传递过来的参数必须是一个函数
    if (typeof executor !== "function") {
        throw new TypeError("executor must be a function.");
    }
    let promiseResolve = null;
    this.promise = new Promise(resolve => {
        // 存储resolve函数
        promiseResolve = resolve;
    });

    this.promise.then(reason => {
        // 执行被订阅的函数
        if (!this._listener) {
            return;
        }
        // 执行被订阅的函数时 可以传递取消请求的消息
        this._listener.forEach(subscribedFunc => subscribedFunc(reason));
    });

    // 将取消函数抛给外部进行使用
    excutor(message => {
        // 添加取消的原因属性
        this.reason = new Cancel(message);
        // 将当前promise的状态设置为resolve
        promiseResolve(this.reason);
    });
}
// 订阅一个函数
CancelToken.prototype.subscribe = function (handler) {
    if (this._listener) {
        this._listener.push(handler);
    } else {
        this._listener = [handler];
    }
};

//  CancelToken.source的实现
CancelToken.source = function () {
    let cancel = null;
    const token = new CancelToken(c => {
        // 抛出取消函数
        cancel = c;
    });
    return {
        token,
        cancel
    };
};
```

## 防 xsrf 攻击

在 config 中存在两个默认配置`xsrfCookieName`和`xsrfHeaderName`，分别对应存储在本地 cookie 的 name、cookie 加入到请求头中所对应的字段名。在发送请求之前，会依次判断`是否为浏览器环境`、`允许携带cookie(withCredential属性)或同源`，如果满足上述两个条件就加入到请求头中供后端进行验证（`这个地方应该是需要后端进行配合来进行验证！`）
