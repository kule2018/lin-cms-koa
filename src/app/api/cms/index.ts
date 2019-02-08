import { user } from "./user";
import { test } from "./test";
import { Redprint } from "../../../lin/redprint";

const cms = new Redprint({ prefix: "/cms" });

cms.use(user.routes()).use(user.allowedMethods());
cms.use(test.routes()).use(test.allowedMethods());

export { cms };
