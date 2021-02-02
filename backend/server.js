const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const WS = require('ws');

const app = new Koa();

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback())
const wsServer = new WS.Server({ server });


const users = new Set();
const messages = [];

wsServer.on('connection', (ws, req) => {
  ws.on('message', msg => {
    const message = JSON.parse(msg);
    if (message.type === "addMessage") {
      [...wsServer.clients]
      .filter(o => o.readyState === WS.OPEN)
      .forEach(o => o.send(msg));
      messages.push(msg);
    } else if (message.type === "addUser") {
      if (users.has(message.data)) {
        [...wsServer.clients]
      .filter(o => o.readyState === WS.OPEN)
      .forEach(o => o.send(JSON.stringify({type: 'addUser', data: false})));
      } else {
        users.add(message.data);
        [...wsServer.clients]
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify({type: "allUsers", data: Array.from(users)})));
      }
    }



    
  });

  ws.send(JSON.stringify({type: 'system', data: 'Сервер: чат запустился'}));
  ws.send(JSON.stringify({type: 'addMessage', data: messages}));
});

server.listen(port);
