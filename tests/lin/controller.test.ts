import { Controller, Get } from "../../src/lin/controller";

@Controller("/user")
class UserController {
  @Get("/")
  async get() {
    return "hello world";
  }
}

const user = new UserController();

// user.get();

const path = Reflect.getMetadata("path", UserController);

const path1 = Reflect.getMetadata("path", user.get);

console.log(user);
