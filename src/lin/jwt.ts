import jwtGenerator, { TokenExpiredError } from "jsonwebtoken";
import {
  ExpiredTokenException,
  InvalidTokenException,
  AuthFailed,
  NotFound
} from "./exception";
import Application from "koa";
import { RouterContext } from "koa-router";
import { get } from "lodash";
import { UserInterface } from "./interface";
import { routeMetaInfo } from "./core";
import { TokenType } from "./enums";

export class Token {
  private secret: string | undefined;
  private accessExp: number = Math.floor(Date.now() / 1000) + 60 * 60; // 1h;
  private refreshExp: number =
    Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 3; // 3 months

  constructor(secret?: string, accessExp?: number, refreshExp?: number) {
    secret && (this.secret = secret);
    refreshExp && (this.refreshExp = refreshExp);
    accessExp && (this.accessExp = accessExp);
  }

  /**
   * initApp
   */
  public initApp(
    app: Application,
    secret?: string,
    accessExp?: number,
    refreshExp?: number
  ) {
    // 将jwt实例挂到app的context上
    app.context.jwt = this;
    secret && (this.secret = secret);
    refreshExp && (this.refreshExp = refreshExp);
    accessExp && (this.accessExp = accessExp);
  }

  /**
   * 生成access_token
   * @param identity 标识位
   */
  public createAccessToken(identity: string | number) {
    if (!this.secret) {
      throw new Error("密匙不可为空");
    }
    return jwtGenerator.sign(
      {
        exp: this.accessExp,
        identity: identity,
        type: TokenType.ACCESS
      },
      this.secret
    );
  }

  /**
   * 生成refresh_token
   * @param identity 标识位
   */
  public createRefreshToken(identity: string | number) {
    if (!this.secret) {
      throw new Error("密匙不可为空");
    }
    return jwtGenerator.sign(
      {
        exp: this.refreshExp,
        identity: identity,
        type: TokenType.REFRESH
      },
      this.secret
    );
  }

  /**
   * verifyToken 验证token
   * 若过期，抛出ExpiredTokenException
   * 若失效，抛出InvalidTokenException
   */
  public verifyToken(token: string) {
    if (!this.secret) {
      throw new Error("密匙不可为空");
    }
    // NotBeforeError
    // TokenExpiredError
    let decode;
    try {
      decode = jwtGenerator.verify(token, this.secret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ExpiredTokenException();
      } else {
        throw new InvalidTokenException();
      }
    }
    return decode;
  }
}

/**
 * jwt 的实例
 */
const jwt = new Token();

/**
 * 颁发令牌
 * @param user 用户
 */
function getTokens(user: UserInterface) {
  const accessToken = jwt.createAccessToken(user.id);
  const refreshToken = jwt.createRefreshToken(user.id);
  return { accessToken, refreshToken };
}

async function parseHeader(ctx: RouterContext, type = TokenType.ACCESS) {
  // 此处借鉴了koa-jwt
  if (!ctx.header || !ctx.header.authorization) {
    ctx.throw(new AuthFailed({ msg: "认证失败，请检查请求令牌是否正确" }));
  }
  const parts = ctx.header.authorization.split(" ");

  if (parts.length === 2) {
    // Bearer 字段
    const scheme = parts[0];
    // token 字段
    const token = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      const obj = ctx.jwt.verifyToken(token);
      if (!get(obj, "type") || get(obj, "type") !== type) {
        ctx.throw(new AuthFailed({ msg: "请使用正确类型的令牌" }));
      }
      const user = await ctx.manager.userModel.findOne({
        id: get(obj, "identity")
      });
      if (!user) {
        ctx.throw(new NotFound({ msg: "用户不存在" }));
      }
      // 将user挂在ctx上
      ctx.currentUser = user;
    }
  } else {
    ctx.throw(new AuthFailed());
  }
}

async function loginRequired(ctx: RouterContext, next: () => Promise<any>) {
  await parseHeader(ctx);
  next();
}

async function refreshTokenRequired(
  ctx: RouterContext,
  next: () => Promise<any>
) {
  // 添加access 和 refresh 的标识位
  await parseHeader(ctx, TokenType.REFRESH);
  next();
}

async function groupRequired(ctx: RouterContext, next: () => Promise<any>) {
  await parseHeader(ctx);
  const currentUser = ctx.currentUser;
  // 用户处于未激活状态
  if (!currentUser || !currentUser.isActive) {
    throw new AuthFailed({ msg: "您目前处于未激活状态，请联系超级管理员" });
  }
  // 超级管理员
  if (currentUser && currentUser.isSuper) {
    await next();
  } else {
    const groupId = currentUser!.groupId;
    if (!groupId) {
      throw new AuthFailed({
        msg: "您还不属于任何权限组，请联系超级管理员获得权限"
      });
    }
    if (ctx.matched) {
      const routeName = ctx._matchedRouteName || ctx.routerName;
      const endpoint = `${ctx.method} ${routeName}`;
      const { auth, module } = routeMetaInfo.get(endpoint);
      const item = await ctx.manager.authModel.findOne({ auth, module });
      // console.log(item);
      if (item) {
        next();
      }
    } else {
      throw new AuthFailed({ msg: "权限不够，请联系超级管理员获得权限" });
    }
  }
}

async function adminRequired(ctx: RouterContext, next: () => Promise<any>) {
  await parseHeader(ctx);
  const currentUser = ctx.currentUser;
  if (currentUser && currentUser.isSuper) {
    next();
  } else {
    throw new AuthFailed({ msg: "只有超级管理员可操作" });
  }
}

export {
  jwt,
  getTokens,
  loginRequired,
  groupRequired,
  adminRequired,
  refreshTokenRequired
};
