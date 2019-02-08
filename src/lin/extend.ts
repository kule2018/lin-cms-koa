import Application from "koa";
import { HttpException } from "./exception";
import Parameter from "parameter";
import consola from "consola";
import { toLine } from "./util";
import { JsonMixin } from "./mixin";
import { get, remove, findIndex, isArray, set } from "lodash";

const param = new Parameter();

export const validate = (app: Application) => {
  app.context.validate = function(rule: any, data: any) {
    data =
      data ||
      Object.assign({}, this.request.body, this.request.query, this.params);
    const msg = param.validate(rule, data);
    console.log(msg);
    if (msg) {
      let errors = Object.create(null);
      if (isArray(msg)) {
        msg.map(it => {
          const rl = get(rule, it["field"]);
          // errors[it["field"]] = [it["message"]];
          errors[it["field"]] = [rl["message"]];
        });
      } else {
        errors = msg;
      }
      this.throw(new HttpException({ msg: errors }));
    }
    return data;
  };
};

export const json = (app: Application) => {
  app.context.json = function(obj: any, hide = []) {
    this.type = "application/json";
    let data = Object.create(null);
    if (typeof obj === "object") {
      if (obj instanceof JsonMixin) {
        transform(obj, hide, data);
      } else if (obj instanceof HttpException) {
        transform(obj, hide, data);
        set(data, "url", this.request.url);
      } else {
        Object.keys(obj).forEach(key => {
          data[toLine(key)] = obj[key];
        });
      }
    } else {
      data = obj;
    }
    // this.body = JSON.stringify(data);
    this.body = data;
  };
};

function transform(obj: any, hide: Array<any>, data: any) {
  const fields: string[] = get(obj, "fields", []);
  if (isArray(hide) && hide.length > 0) {
    remove(fields, item => {
      return findIndex(hide, item as any) !== -1;
    });
  }
  fields.forEach(field => {
    // data[toLine(field)] = obj[field];
    data[toLine(field)] = get(obj, field);
  });
}

export const logger = (app: Application) => {
  app.context.logger = consola;
};
