import {
  IsInt,
  Length,
  IsEmail,
  Matches,
  Min,
  IsNotEmpty,
  IsOptional
} from "class-validator";
import { EqualFeild, Form } from "../../lin/form";

export class RegisterForm extends Form {
  @Length(2, 20, { message: "昵称长度必须在2~10之间" })
  @IsNotEmpty({ message: "昵称不可为空" })
  nickname!: string;

  @Min(1, { message: "分组id必须大于0" })
  @IsInt({ message: "分组id必须是整数" })
  @IsNotEmpty({ message: "请输入分组id" })
  groupId!: number;

  @IsEmail({}, { message: "电子邮箱不符合规范，请输入正确的邮箱" })
  @IsOptional()
  email!: string;

  @EqualFeild("confirmPassword", {
    message: "两次输入的密码不一致，请输入相同的密码"
  })
  @Matches(/^[A-Za-z0-9_*&$#@]{6,22}$/, {
    message: "密码长度必须在6~22位之间，包含字符、数字和 _ "
  })
  @IsNotEmpty({ message: "新密码不可为空" })
  password!: string;

  @IsNotEmpty({ message: "请输入确认密码" })
  confirmPassword!: string;
}

export class LoginForm extends Form {
  @IsNotEmpty({ message: "请填写昵称" })
  nickname!: string;
  @IsNotEmpty({ message: "密码不可为空" })
  password!: string;
}

/**
 * 用户更新自己的邮箱
 */
export class UpdateInfoForm extends Form {
  @IsEmail({}, { message: "电子邮箱不符合规范，请输入正确的邮箱" })
  @IsNotEmpty({ message: "请输入新邮箱" })
  email!: string;
}

export class ResetPasswordForm extends Form {
  @EqualFeild("confirmPassword", {
    message: "两次输入的密码不一致，请输入相同的密码"
  })
  @Matches(/^[A-Za-z0-9_*&$#@]{6,22}$/, {
    message: "密码长度必须在6~22位之间，包含字符、数字和 _ "
  })
  @IsNotEmpty({ message: "新密码不可为空" })
  newPassword!: string;

  @IsNotEmpty({ message: "请确认密码" })
  confirmPassword!: string;
}

export class ChangePasswordForm extends Form {
  @EqualFeild("confirmPassword", {
    message: "两次输入的密码不一致，请输入相同的密码"
  })
  @Matches(/^[A-Za-z0-9_*&$#@]{6,22}$/, {
    message: "密码长度必须在6~22位之间，包含字符、数字和 _ "
  })
  @IsNotEmpty({ message: "新密码不可为空" })
  newPassword!: string;

  @IsNotEmpty({ message: "请确认密码" })
  confirmPassword!: string;

  @IsNotEmpty({ message: "请输入旧密码" })
  oldPassword!: string;
}
