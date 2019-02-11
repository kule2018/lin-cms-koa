import Router, { IMiddleware } from "koa-router";
import { assert } from "./util";
import { routeMetaInfo } from "./core";

export interface Meta {
  auth?: string;
  module?: string;
  mount?: boolean;
}
/**
 * redpint继承自koa-router
 * 即可使用全部的koa-router api
 * 也可使用已 red 为前缀的方法，用于视图函数的权限
 */
export class Redprint extends Router {
  redOption(
    name: string,
    path: string | RegExp,
    meta?: Meta,
    ...middleware: IMiddleware[]
  ) {
    if (meta && meta.mount) {
      assert(
        !!(meta.auth && meta.module),
        "auth and module must not be empty, if you want to mount"
      );
      const endpoint = "OPTION " + name;
      routeMetaInfo.set(endpoint, { auth: meta.auth, module: meta.module });
    }
    return this.options(name, path, ...middleware);
  }

  redHead(
    name: string,
    path: string | RegExp,
    meta?: Meta,
    ...middleware: IMiddleware[]
  ) {
    if (meta && meta.mount) {
      assert(
        !!(meta.auth && meta.module),
        "auth and module must not be empty, if you want to mount"
      );
      const endpoint = "HEAD " + name;
      routeMetaInfo.set(endpoint, { auth: meta.auth, module: meta.module });
    }
    return this.head(name, path, ...middleware);
  }

  redGet(
    name: string,
    path: string | RegExp,
    meta?: Meta,
    ...middleware: IMiddleware[]
  ) {
    if (meta && meta.mount) {
      assert(
        !!(meta.auth && meta.module),
        "auth and module must not be empty, if you want to mount"
      );
      const endpoint = "GET " + name;
      routeMetaInfo.set(endpoint, { auth: meta.auth, module: meta.module });
    }
    return this.get(name, path, ...middleware);
  }

  redPut(
    name: string,
    path: string | RegExp,
    meta?: Meta,
    ...middleware: IMiddleware[]
  ) {
    if (meta && meta.mount) {
      assert(
        !!(meta.auth && meta.module),
        "auth and module must not be empty, if you want to mount"
      );
      const endpoint = "PUT " + name;
      routeMetaInfo.set(endpoint, { auth: meta.auth, module: meta.module });
    }
    return this.put(name, path, ...middleware);
  }

  redPatch(
    name: string,
    path: string | RegExp,
    meta?: Meta,
    ...middleware: IMiddleware[]
  ) {
    if (meta && meta.mount) {
      assert(
        !!(meta.auth && meta.module),
        "auth and module must not be empty, if you want to mount"
      );
      const endpoint = "PATCH " + name;
      routeMetaInfo.set(endpoint, { auth: meta.auth, module: meta.module });
    }
    return this.patch(name, path, ...middleware);
  }

  redPost(
    name: string,
    path: string | RegExp,
    meta?: Meta,
    ...middleware: IMiddleware[]
  ) {
    if (meta && meta.mount) {
      assert(
        !!(meta.auth && meta.module),
        "auth and module must not be empty, if you want to mount"
      );
      const endpoint = "POST " + name;
      routeMetaInfo.set(endpoint, { auth: meta.auth, module: meta.module });
    }
    return this.post(name, path, ...middleware);
  }

  redDelete(
    name: string,
    path: string | RegExp,
    meta?: Meta,
    ...middleware: IMiddleware[]
  ) {
    if (meta && meta.mount) {
      assert(
        !!(meta.auth && meta.module),
        "auth and module must not be empty, if you want to mount"
      );
      const endpoint = "DELETE " + name;
      routeMetaInfo.set(endpoint, { auth: meta.auth, module: meta.module });
    }
    return this.delete(name, path, ...middleware);
  }
}

// rd(
//   path: string | RegExp ,
//   method?: HttpMethod,
//   ...middleware: IMiddleware[]
// ) {
//   return (
//     target: Function,
//     key?: string | symbol,
//     descriptor?: any
//   ): void => {
//     switch (method) {
//       case HttpMethod.HEAD:
//         this.head(path, ...middleware, descriptor.value);
//         break;
//       case HttpMethod.OPTIONS:
//         this.options(path, ...middleware, descriptor.value);
//         break;
//       case HttpMethod.GET:
//         this.get(path, ...middleware, descriptor.value);
//         break;
//       case HttpMethod.PUT:
//         this.put(path, ...middleware, descriptor.value);
//         break;
//       case HttpMethod.PATCH:
//         this.patch(path, ...middleware, descriptor.value);
//         break;
//       case HttpMethod.POST:
//         this.post(path, ...middleware, descriptor.value);
//         break;
//       case HttpMethod.DELETE:
//         this.delete(path, ...middleware, descriptor.value);
//         break;
//       default:
//         throw new Error("not method macthed");
//     }
//   };
// }
