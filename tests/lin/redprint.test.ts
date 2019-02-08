import { Redprint } from "../../src/lin/redprint";
import { routeMetaInfo } from "../../src/lin/core";
import { groupRequired } from "../../src/lin/jwt";

// ts的装饰器只能对类和类方法使用，不能对函数直接使用
// 拒绝脸

test("测试红图挂载", () => {
  const rp = new Redprint({ prefix: "test" });
  console.log(routeMetaInfo);
  rp.redGet(
    "/",
    { auth: "打个招呼", module: "看看你咯", mount: true },
    groupRequired,
    async (ctx, next) => {
      ctx.body = "world";
    }
  );

  // rp.match

  expect(routeMetaInfo).not.toBe(null);
  console.log(routeMetaInfo);
});
