import { IRouterContext } from "koa-router";
import { routeMetaInfo } from "./core";

export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === "undefined";

export const isFunction = (fn: any): boolean => typeof fn === "function";

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === "object";

export const isString = (fn: any): fn is string => typeof fn === "string";

export const isConstructor = (fn: string): boolean => fn === "constructor";

export const validatePath = (path?: string): string =>
  path ? (path.charAt(0) !== "/" ? "/" + path : path) : "";

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

export function findAuthAndModule(ctx: IRouterContext) {
  const routeName = ctx._matchedRouteName || ctx.routerName;
  const endpoint = `${ctx.method} ${routeName}`;
  return routeMetaInfo.get(endpoint);
}
