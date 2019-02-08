import request from "supertest";
import { createApp } from "../../../src/app/app";

test("测试/cms/test", async () => {
  const app = await createApp();
  const response = await request(app.callback()).get("/cms/test/");
  app.context.db.close();
  expect(response.status).toBe(200);
});
