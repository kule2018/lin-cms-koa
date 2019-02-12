import Application from "koa";
import { IMiddleware } from "koa-router";
import { jwt } from "./jwt";
import { assert } from "./util";
import { DBManager } from "./db";
import {
  UserInterface,
  GroupInterface,
  AuthInterface,
  LogInterface
} from "./interface";
import { json, validate, logger } from "./extend";
import { NotFound, AuthFailed } from "./exception";
import { EntitySchema, Entity } from "typeorm";
import { set, get } from "lodash";
import { Loader } from "./loader";
import { Redprint } from "./redprint";

// tslint:disable-next-line:variable-name
export const __version__ = "0.0.1";

// 存放meta路由信息
export const routeMetaInfo = new Map();

// 初始化各种扩展，中间件
export class Lin {
  private manager: Manager | undefined;
  private app: Application | undefined;

  public async initApp(
    app: Application,
    mount: boolean = true, // 是否挂载插件路由，默认为true
    synchronize?: boolean, // 是否同步模型到数据库
    userModel?: any,
    groupModel?: any,
    authModel?: any
  ) {
    this.app = app;
    assert(!!this.app, "app must not be null");
    // 2. 默认扩展 json logger validate
    this.applyDefaultExtends();
    // 3. manager
    userModel = userModel || User;
    groupModel = groupModel || Group;
    authModel = authModel || Auth;
    this.applyManager(userModel, groupModel, authModel);
    // 4. db 同步到数据库默认为false，每次同步会很慢 todo 抽离
    await this.applyDB(synchronize, userModel, groupModel, authModel);
    // 5. jwt
    this.applyJwt();
    // 6. 挂载默认路由
    mount && this.mount();
  }

  private applyJwt() {
    const secret = this.app!.context.config.getItem("secret");
    jwt.initApp(this.app!, secret);
  }

  private async applyDB(
    synchronize?: boolean,
    ...entities: (Function | string | EntitySchema<any>)[]
  ) {
    const pluginEntities: any[] = [];
    Object.values(this.manager!.plugins).forEach(plugin => {
      const models = Object.values(get(plugin, "models"));
      models.forEach(model => {
        pluginEntities.push(model);
      });
    });
    const db = new DBManager();
    await db.initApp(this.app!, synchronize, ...entities, ...pluginEntities);
  }

  private applyManager(userModel: any, groupModel: any, authModel: any) {
    const manager = new Manager();
    this.manager = manager;
    const pluginPath = this.app!.context.config.getItem("pluginPath");
    manager.initApp(this.app!, userModel, groupModel, authModel, pluginPath);
  }

  private applyDefaultExtends() {
    json(this.app!);
    validate(this.app!);
    logger(this.app!);
  }

  private mount() {
    const pluginRp = new Redprint({ prefix: "/plugin" });
    Object.values(this.manager!.plugins).forEach(plugin => {
      const controllers = Object.values(get(plugin, "controllers"));
      controllers.forEach(cont => {
        pluginRp
          .use((cont as any).routes() as IMiddleware)
          .use((cont as any).allowedMethods() as IMiddleware);
      });
    });
    this.app!.use(pluginRp.routes()).use(pluginRp.allowedMethods());
  }
}

// 管理插件，数据模型
export class Manager {
  public loader: Loader | undefined;
  public userModel: any;
  public groupModel: any;
  public authModel: any;

  public initApp(
    app: Application,
    userModel: any,
    groupModel: any,
    authModel: any,
    pluginPath: {}
  ) {
    app.context.manager = this;
    this.userModel = userModel;
    this.groupModel = groupModel;
    this.authModel = authModel;
    this.loader = new Loader(pluginPath, app);
  }

  public get plugins() {
    return this.loader!.plugins;
  }

  public verify(nickname: string, password: string) {
    return this.userModel.verify(nickname, password);
  }

  public findUser(args: {}) {
    return this.userModel.findOne({ ...args });
  }

  public findGroup(args: {}) {
    return this.groupModel.findOne({ ...args });
  }
}

/**
 * 权限系统中的User模型
 */
@Entity({ name: "lin_user" })
export class User extends UserInterface {
  /**
   * 验证用户名和密码，如通过得到user实例
   * @static
   * @param {string} nickname
   * @param {string} password
   * @returns
   * @memberof User
   */
  public static async verify(nickname: string, password: string) {
    const user = await this.findOne({ nickname });
    if (!user) {
      throw new NotFound({ msg: "用户不存在" });
    }
    if (!user.checkPassword(password)) {
      throw new AuthFailed({ msg: "密码错误，请输入正确密码" });
    }
    return user;
  }

  public resetPassword(newPassword: string) {
    // 注意，重置密码后记得提交至数据库
    this.password = newPassword;
  }

  public changePassword(oldPassword: string, newPassword: string) {
    // 注意，修改密码后记得提交至数据库
    if (this.checkPassword(oldPassword)) {
      this.password = newPassword;
      return true;
    }
    return false;
  }
}

/**
 * 权限系统中的Group模型
 */
@Entity({ name: "lin_group" })
export class Group extends GroupInterface {}

/**
 * 权限系统中的Auth模型
 */
@Entity({ name: "lin_auth" })
export class Auth extends AuthInterface {}

export interface LogArgs {
  message?: string;
  userId?: number;
  userName?: string;
  statusCode?: number;
  method?: string;
  path?: string;
  authority?: string;
}

@Entity({ name: "lin_log" })
export class Log extends LogInterface {
  public static createLog(args?: LogArgs, commit?: boolean) {
    const log = new Log();
    if (args) {
      Object.keys(args).forEach(arg => {
        set(log, arg, get(args, arg));
      });
    }
    commit && log.save();
    return log;
  }
}
