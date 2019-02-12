import { IRouterContext } from "koa-router";
import { routeMetaInfo } from "./core";
import { get } from "lodash";
import { config } from "./config";
import { ParametersException } from "./exception";

export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === "undefined";

export const isFunction = (fn: any): boolean => typeof fn === "function";

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === "object";

export const isString = (fn: any): fn is string => typeof fn === "string";

export const isConstructor = (fn: string): boolean => fn === "constructor";

export const validatePath = (path?: string): string =>
  path ? (path.charAt(0) !== "/" ? "/" + path : path) : "";

// tslint:disable-next-line: strict-type-predicates
export const isNil = (obj: null): boolean => isUndefined(obj) || obj === null;

export const isEmpty = (array: { length: number }): boolean =>
  !(array && array.length > 0);

export const isSymbol = (fn: any): fn is symbol => typeof fn === "symbol";

/**
 * Assertion utility.
 */
export function assert(ok: boolean, ...args: string[]): void {
  if (!ok) {
    throw new Error(args.join(" "));
  }
}

// 下划线转换驼峰
export function toHump(name: string) {
  return name.replace(/\_(\w)/g, (_, letter) => {
    return letter.toUpperCase();
  });
}

// 驼峰转换下划线
export function toLine(name: string) {
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * 通过当前的路由名找到对应的权限录入信息
 * @param ctx koa 的 context
 */
export function findAuthAndModule(ctx: IRouterContext) {
  const routeName = ctx._matchedRouteName || ctx.routerName;
  const endpoint = `${ctx.method} ${routeName}`;
  return routeMetaInfo.get(endpoint);
}

/**
 * 检查日期的格式为 "YYYY-MM-DD HH:mm:ss"
 * @param time input time
 */
export function checkDateFormat(time: string) {
  const r = time.match(
    /^(\d{4})(-|\/)(\d{2})\2(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
  );
  if (r === null) return false;
  const d = new Date(
    parseInt(r[1], 10),
    parseInt(r[3], 10) - 1,
    parseInt(r[4], 10),
    parseInt(r[5], 10),
    parseInt(r[6], 10),
    parseInt(r[7], 10)
  );
  return (
    d.getFullYear() === parseInt(r[1], 10) &&
    d.getMonth() + 1 === parseInt(r[3], 10) &&
    d.getDate() === parseInt(r[4], 10) &&
    d.getHours() === parseInt(r[5], 10) &&
    d.getMinutes() === parseInt(r[6], 10) &&
    d.getSeconds() === parseInt(r[7], 10)
  );
}

export function paginate(ctx: IRouterContext) {
  let count =
    get(ctx.request.query, "count") || config.getItem("countDefault", 10);
  let start =
    get(ctx.request.query, "page") || config.getItem("pageDefault", 0);
  count = count >= 15 ? 15 : count;
  start = start * count;
  if (start < 0 || count < 0) {
    throw new ParametersException({ msg: "请输入正确的分页参数" });
  }
  return { start, count };
}
