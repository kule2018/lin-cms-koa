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
import { toHump } from "./util";
import { IRouterContext } from "koa-router";

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
