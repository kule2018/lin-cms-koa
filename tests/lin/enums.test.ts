import { UserActive, UserSuper } from "../../src/lin/enums";

test("测试UserSuper", () => {
  expect(UserSuper.COMMON).toBe(1);
  expect(UserSuper.SUPER).toBe(2);
});

test("测试UserActive", () => {
  expect(UserActive.ACTIVE).toBe(1);
  expect(UserActive.NOT_ACTIVE).toBe(2);
});
