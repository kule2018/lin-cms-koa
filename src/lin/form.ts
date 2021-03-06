import {
  validateSync,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraintInterface,
  ValidatorConstraint,
  ValidationArguments
} from "class-validator";
import { ParametersException } from "./exception";
import { get, set } from "lodash";
import { toHump, checkDateFormat } from "./util";
import { IRouterContext } from "koa-router";

/**
 * 判断两个属性是否相等
 * @param property 属性名
 * @param validationOptions 校验参数
 */
export function EqualFeild(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: EqualFeildConstraint
    });
  };
}

@ValidatorConstraint({ name: "EqualFeild" })
export class EqualFeildConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }
}

@ValidatorConstraint({ name: "DateFormat", async: false })
export class DateFormat implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return checkDateFormat(text);
  }

  defaultMessage(args: ValidationArguments) {
    return "请输入正确格式的时间";
  }
}

/**
 * form基础类
 */
export class Form {
  constructor(ctx: IRouterContext) {
    const data = Object.assign(
      {},
      ctx.request.body,
      ctx.request.query,
      ctx.params
    );
    Object.keys(data).forEach(it => {
      set(this, toHump(it), get(data, it));
    });
  }

  /**
   * 校验，同步方法
   */
  public validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      let res = Object.create(null);
      if (errors.length === 1) {
        res = Object.values(errors[0].constraints)[0];
      } else {
        errors.forEach(err => {
          res[err.property] = Object.values(err.constraints);
        });
      }
      console.log(res);
      throw new ParametersException({ msg: res });
    } else {
      return this;
    }
  }
}
