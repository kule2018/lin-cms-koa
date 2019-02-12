import { assert } from "./util";
import { get, set } from "lodash";
import Application from "koa";
import Router from "koa-router";
import path from "path";
import { Plugin } from "./plugin";
import { BaseEntity } from "typeorm";

/**
 * loader of lin
 * work for loading plugins
 */
export class Loader {
  public pluginPath: {};
  private app: Application;
  public plugins = {};
  constructor(pluginPath: {}, app: Application) {
    assert(!!pluginPath, "pluginPath must not be empty");
    this.pluginPath = pluginPath;
    this.app = app;
    this.loadPlugins();
  }

  /**
   * 加载插件
   */
  public loadPlugins() {
    Object.keys(this.pluginPath).forEach(item => {
      // item is name of plugin
      if (get(this.pluginPath, `${item}.enable`)) {
        const path1 = get(this.pluginPath, `${item}.path`);
        const baseDir = process.cwd();
        let confPath = "";
        if (process.env.NODE_ENV === "production") {
          confPath = path.resolve(baseDir, path1, "config.js");
        } else {
          confPath = path.resolve(baseDir, path1, "config.ts");
        }
        const appPath = path.resolve(baseDir, path1, "app");
        const incomingConf = get(this.pluginPath, item);
        this.loadConfig(item, confPath, incomingConf);
        this.loadPlugin(item, appPath);
      }
    });
  }

  /**
   * loadPlugin 加载单个插件
   */
  public loadPlugin(name: string, path: string) {
    const mod = require(path);
    const exports = get(mod, "default");
    const plugin = new Plugin(name);
    Object.keys(exports).forEach(key => {
      if (exports[key] instanceof Router) {
        plugin.addController(key, exports[key]);
      } else if (get(exports[key], "__proto__") === BaseEntity) {
        // todo 后续考虑支持不继承BaseEntity的模型
        // Object.is()
        plugin.addModel(key, exports[key]);
      }
    });
    this.plugins[name] = plugin;
  }

  /**
   * loadConfig 加载插件配置
   */
  public loadConfig(name: string, path: string, incomingConf: {}) {
    const mod = require(path);
    const conf = get(mod, "default");
    const newConf = {};
    set(newConf, name, { ...conf, ...incomingConf });
    this.app.context.config.getConfigFromObj(newConf);
  }
}
