// 大量借鑒了nest.js
import { isUndefined } from "./util";

const PATH_METADATA = "path";
const METHOD_METADATA = "method";

export enum RequestMethod {
  GET = 0,
  POST,
  PUT,
  DELETE,
  PATCH,
  ALL,
  OPTIONS,
  HEAD
}

export function Controller(prefix?: string): ClassDecorator {
  const path = isUndefined(prefix) ? "/" : prefix;
  return (target: object) => {
    Reflect.defineMetadata("path", path, target);
  };
}

const defaultMetadata = {
  [PATH_METADATA]: "/",
  [METHOD_METADATA]: RequestMethod.GET
};

export interface RequestMappingMetadata {
  path?: string | string[];
  method?: RequestMethod;
}

export const RequestMapping = (
  metadata: RequestMappingMetadata = defaultMetadata
): MethodDecorator => {
  const pathMetadata = metadata[PATH_METADATA];
  const path = pathMetadata && pathMetadata.length ? pathMetadata : "/";
  const requestMethod = metadata[METHOD_METADATA] || RequestMethod.GET;

  return (target, key, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
    Reflect.defineMetadata(METHOD_METADATA, requestMethod, descriptor.value);
    return descriptor;
  };
};

const createMappingDecorator = (method: RequestMethod) => (
  path?: string | string[]
): MethodDecorator => {
  return RequestMapping({
    [PATH_METADATA]: path,
    [METHOD_METADATA]: method
  });
};

/**
 * Routes HTTP POST requests to the specified path.
 */
export const Post = createMappingDecorator(RequestMethod.POST);

/**
 * Routes HTTP GET requests to the specified path.
 */
export const Get = createMappingDecorator(RequestMethod.GET);

/**
 * Routes HTTP DELETE requests to the specified path.
 */
export const Delete = createMappingDecorator(RequestMethod.DELETE);

/**
 * Routes HTTP PUT requests to the specified path.
 */
export const Put = createMappingDecorator(RequestMethod.PUT);

/**
 * Routes HTTP PATCH requests to the specified path.
 */
export const Patch = createMappingDecorator(RequestMethod.PATCH);

/**
 * Routes HTTP OPTIONS requests to the specified path.
 */
export const Options = createMappingDecorator(RequestMethod.OPTIONS);

/**
 * Routes HTTP HEAD requests to the specified path.
 */
export const Head = createMappingDecorator(RequestMethod.HEAD);

/**
 * Routes all HTTP requests to the specified path.
 */
export const All = createMappingDecorator(RequestMethod.ALL);
