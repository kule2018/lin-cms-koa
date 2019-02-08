const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();

const router = new Router({
  prefix: '/v1'
});

const map = new Map();

async function preHandle (ctx, next) {
  await next();
}

router.get('getUser', '/', preHandle, async ctx => {
  ctx.body = 'hello world';
});

router.post('createUser', '/', preHandle, async ctx => {
  ctx.body = 'hello world';
});

router.put('updateUser', '/', preHandle, async ctx => {
  ctx.body = 'hello world';
});

router.delete('deleteUser', '/', preHandle, async ctx => {
  ctx.body = 'hello world';
});

router.stack.forEach(item => {
  let endpoint = '';
  item.methods.forEach(method => {
    endpoint += ` ${method}`;
  });
  endpoint += item.path;
  map.set(endpoint, endpoint);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('listening at localhost:3000');
});

// middleware -> dispatch -> router -> stack[0] -> methods & path
