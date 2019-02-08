import Router from "koa-router";

const ossApi = new Router();

ossApi.get("/", async ctx => {
  ctx.json({
    msg: "hello plugin"
  });
});

export default ossApi;
