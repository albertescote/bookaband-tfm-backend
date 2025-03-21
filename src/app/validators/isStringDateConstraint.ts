import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "isStringDate", async: false })
export class IsStringDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value === "string") {
      return !isNaN(new Date(value).getTime());
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return "date must be a Date instance or a valid date string";
  }
}

export function IsStringDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStringDateConstraint,
    });
  };
}
