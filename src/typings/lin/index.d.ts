import * as Koa from "koa";
import * as Router from "koa-router";
import { Token } from "../../lin/jwt";
import Config from "../../lin/config";
import { Connection } from "typeorm";
import { UserInterface } from "../../lin/interface";
import { Manager } from "../../lin/core";

declare class Consola {
  fatal(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  log(message: string): void;
  info(message: string): void;
  start(message: string): void;
  success(message: string): void;
  ready(message: string): void;
  debug(message: string): void;
  trace(message: string): void;
  addReporter(reporter: (message: string) => void): typeof Consola;
  removeReporter(): typeof Consola;
  withTag(tag: string): typeof Consola;
  withScope(tag: string): typeof Consola;
  wrapAll(): void;
  restoreAll(): void;
  wrapConsole(): void;
  restoreConsole(): void;
  wrapStd(): void;
  restoreStd(): void;
  pauseLogs(): void;
  resumeLogs(): void;
}

declare module "koa" {
  interface Context {
    // 日志类
    logger: Consola;
    //  最先拿到配置
    config: Config;
    // 随后初始化数据库
    db: Connection;
    // jwt以来于数据库
    jwt: Token;
    // jwt认证后才有currentUser
    currentUser: UserInterface | undefined;
    manager: Manager;
  }
}
