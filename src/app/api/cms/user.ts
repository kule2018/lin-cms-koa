import {
  getTokens,
  loginRequired,
  refreshTokenRequired,
  jwt
} from "../../../lin/jwt";
import { Redprint } from "../../../lin/redprint";
import {
  RepeatException,
  Success,
  ParametersException,
  Failed
} from "../../../lin/exception";
import { UserInterface } from "../../../lin/interface";
import {
  RegisterForm,
  LoginForm,
  UpdateInfoForm,
  ChangePasswordForm
} from "../../validators/forms";
import { IRouterContext } from "koa-router";

const user = new Redprint({
  prefix: "/user"
});

user.redPost(
  "userRegister",
  "/register",
  { auth: "注册", module: "用户", mount: false },
  async ctx => {
    const form = new RegisterForm(ctx).validate();
    // const data = ctx.validate(registerForm);
    let user = await ctx.manager.userModel.findOne({ nickname: form.nickname });
    if (user) {
      throw new RepeatException({ msg: "用户名重复，请重新输入" });
    }
    if (form.email && form.email.trim() !== "") {
      // todo Not(null)
      user = await ctx.manager.userModel.findOne({ email: form.email });
      if (user) {
        throw new RepeatException({ msg: "注册邮箱重复，请重新输入" });
      }
    }
    registerUser(ctx, form);
    ctx.json(new Success({ msg: "用户创建成功" }));
  }
);

user.redPost(
  "userLogin",
  "/login",
  { auth: "登陆", module: "用户", mount: false },
  async ctx => {
    const form = new LoginForm(ctx).validate();
    let user = await ctx.manager.userModel.verify(form.nickname, form.password);
    // todo 记录日志或者选择不记录
    const { accessToken, refreshToken } = getTokens(user);
    ctx.json({
      accessToken,
      refreshToken
    });
  }
);

user.redPut(
  "userUpdate",
  "/",
  { auth: "用户更新信息", module: "用户", mount: false },
  loginRequired,
  async ctx => {
    const form = new UpdateInfoForm(ctx).validate();
    let user: UserInterface = ctx.currentUser;
    if (user.email !== form.email) {
      const exit = await ctx.manager.userModel.findOne({ email: form.email });
      if (exit) {
        throw new ParametersException({ msg: "邮箱已被注册，请重新输入邮箱" });
      }
    }
    user.email = form.email;
    user.save();
    ctx.json(new Success({ msg: "操作成功" }));
  }
);

// todo 添加记录日志
user.redPut(
  "userUpdatePassword",
  "/change_password",
  { auth: "修改密码", module: "用户", mount: false },
  loginRequired,
  async ctx => {
    const form = new ChangePasswordForm(ctx).validate();
    let user: UserInterface = ctx.currentUser;
    const ok = user.changePassword(form.oldPassword, form.newPassword);
    if (ok as any) {
      user.save();
      ctx.json(new Success({ msg: "密码修改成功" }));
    } else {
      ctx.json(new Failed({ msg: "修改密码失败" }));
    }
  }
);

user.redGet(
  "userGetToken",
  "/refresh",
  { auth: "刷新令牌", module: "用户", mount: false },
  refreshTokenRequired,
  async ctx => {
    let user: UserInterface = ctx.currentUser;
    const accessToken = jwt.createAccessToken(user.id);
    ctx.json({ accessToken });
  }
);

user.redGet(
  "userGetAuths",
  "/auths",
  { auth: "查询自己拥有的权限", module: "用户", mount: false },
  loginRequired,
  async ctx => {
    let user: UserInterface = ctx.currentUser;
    // todo 查询所有权限返回
    ctx.json({ user });
  }
);

function registerUser(ctx: IRouterContext, form: RegisterForm) {
  const user: UserInterface = new ctx.manager.userModel();
  user.nickname = form.nickname;
  user.password = form.password;
  user.groupId = form.groupId;
  if (form.email && form.email.trim() !== "") {
    user.email = form.email;
  }
  user.save();
}

export { user };
