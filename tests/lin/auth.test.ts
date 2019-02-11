import Koa from "koa";
import consola from "consola";
import { Redprint } from "../../src/lin/redprint";
import { routeMetaInfo } from "../../src/lin/core";
import { adminRequired, jwt, getTokens } from "../../src/lin/jwt";
import { DBManager } from "../../src/lin/db";
import { json } from "../../src/lin/extend";
import {
  UserInterface,
  GroupInterface,
  LogInterface,
  EventInterface,
  AuthInterface
} from "../../src/lin/interface";

const app = new Koa();

const start = async () => {
  json(app);
  jwt.initApp(app, "gguiguiguijj");

  await new DBManager().initApp(
    app,
    true,
    UserInterface,
    GroupInterface,
    LogInterface,
    EventInterface,
    AuthInterface
  );

  const rp = new Redprint();

  console.log(routeMetaInfo);

  rp.redGet(
    "做个测试而已啊",
    "/",
    { auth: "打个招呼", module: "看看你咯", mount: true },
    adminRequired,
    async ctx => {
      ctx.json({
        msg: "world"
      });
    }
  );

  rp.post("/token", ctx => {
    const { accessToken, refreshToken } = getTokens({ id: 1 } as any);
    ctx.json({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  });

  console.log(routeMetaInfo);

  app.use(rp.routes()).use(rp.allowedMethods());

  app.listen(3000, () => {
    consola.start("listening at http://localhost:3000");
  });
};

// tslint:disable-next-line: no-floating-promises
start();
