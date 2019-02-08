import * as path from "path";
import { merge, get, has, set } from "lodash";
import Application from "koa";

/**
 * 扩展koa的config类
 *
 * @export
 * @class Config
 */
export default class Config {
  /**
   * 存储所有配置信息
   *
   * @private
   * @type {Object}
   * @memberof Config
   */
  private store: Object = {};

  constructor() {
    //
  }

  public initApp(app: Application) {
    app.context.config = this;
  }

  /**
   * getItem
   */
  public getItem(key: string, defaultVal?: any) {
    return get(this.store, key, defaultVal);
  }

  /**
   * hasItem
   */
  public hasItem(key: string) {
    return has(this.store, key);
  }

  /**
   * setItem
   */
  public setItem(key: string, val: any) {
    set(this.store, key, val);
  }

  /**
   * import导入是异步导入
   * require导入是同步导入
   * getConfigFromFile 选择同步导入配置文件
   */
  public getConfigFromFile(filepath: string) {
    const baseDir = process.cwd();
    const mod = require(path.resolve(baseDir, filepath));
    const conf = get(mod, "default");
    this.store = merge(this.store, conf);
    // try {
    //   const mod = await import(path.resolve(baseDir, filepath))
    //   this.store = merge(this.store, mod)
    // } catch (err) {
    //   throw err;
    // }
  }

  /**
   * getConfigFromObj
   */
  public getConfigFromObj(obj: any) {
    this.store = merge(this.store, obj);
  }
}
