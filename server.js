const Koa = require('koa');
const router = require('koa-router')();
const bodyparser = require('koa-bodyparser');
const cors = require('koa2-cors');
const fs = require('fs');

const app = new Koa()
app.use(bodyparser())

// 解决跨域
app.use(
    cors({
        origin: function (ctx) { //设置允许来自指定域名请求
            return '*';
            // if (ctx.url === '/choose-city') {  return '*'; // 允许来自所有域名请求 }
            // return 'http://localhost:8080'; // 只允许http://localhost:8080这个域名的请求
        },
        maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法'
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
    })
);

// 当服务期被访问的时候,打印出请求类型以及请求的url;
app.use(async (ctx, next) => {
    console.log(`${ctx.request.method} ${ctx.request.url}`);
    await next();
});



// post请求
router.post('/api/postUser', async (ctx, next) => {
    // ctx.request.body  请求的参数
    const { username, password } = ctx.request.body

    if (!username || !password) {
        ctx.response.body = { Msg: "用户名或者密码不能为空", ResultCode: 0 }
        return;
    }

    let ret = null
    try {
        ret = await fs.readFileSync('./user.json')
        ret = JSON.parse(ret.toString())
    } catch (error) {
        ret = []
    }

    ret.push({ username, password })
    ctx.response.body = { Msg: "注册成功", ResultCode: 1 }

    try {
        fs.writeFileSync('./user.json', JSON.stringify(ret))
        ctx.response.body = { Msg: `${username}注册成功`, ResultCode: 1 }
    } catch (err) {
        if (err) ctx.response.body = { Msg: "注册失败，请重新提交", ResultCode: 0 }
    }
});

// post请求
router.post('/api/getUser', async (ctx, next) => {
    const { username, password } = ctx.request.body
    try {
        let ret = fs.readFileSync('./user.json')
        ret = JSON.parse(ret.toString());
        if (username) { ret = ret.filter(item => item.username == username) }
        ctx.response.body = { Data: ret, Msg: ret.length ? "获取成功" : `没有获取到用户${username}`, ResultCode: 1 }
    } catch (err) {
        if (err) ctx.response.body = { Msg: "获取失败，请重新尝试", ResultCode: 0 }
    }
});

// get请求
router.get('/api/getList', async (ctx, next) => {
    ctx.response.body = {
        Data: [
            { key: 0, value: "blue" },
            { key: 1, value: "yellow" },
            { key: 2, value: "green" },
            { key: 3, value: "red" },
            { key: 4, value: "pink" },
        ],
        Msg: "我是get请求",
        ResultCode: 1
    }
});


app.use(router.routes());

const host = '192.11.11.11';
const port = '2255';

app.listen(port, host, () => {
    console.log(`http://${host}:${port}`);
});



