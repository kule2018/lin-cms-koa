import { createConnection, Connection, EntitySchema } from "typeorm";
import Application from "koa";
import { Log } from "./core";

/**
 * 封装数据库类
 */
export class DBManager {
  private db: Connection | undefined;

  private type: string = "mysql";
  private host: string = "localhost";
  private port: number = 3306;
  private username: string = "root";
  private password: string = "123456";

  public async initApp(
    app: Application,
    synchronize?: boolean,
    ...entities: (Function | string | EntitySchema<any>)[]
  ) {
    try {
      // 拿到配置
      const database = app.context.config.getItem("db.database", "lin-cms");
      const type = app.context.config.getItem("db.type", this.type);
      const host = app.context.config.getItem("db.host", this.host);
      const port = app.context.config.getItem("db.port", this.port);
      const username = app.context.config.getItem("db.username", this.username);
      const password = app.context.config.getItem("db.password", this.password);
      // 向entities中加入log模型
      entities.push(Log);
      this.db = await createConnection({
        type,
        host,
        port,
        username,
        password,
        database,
        entities: entities
        // acquireTimeout: 10000,
        // logging: true
      });
      synchronize && (await this.db.synchronize());
      app.context.db = this.db;
    } catch (error) {
      console.log(error);
      // 数据库连接失败，退出程序
      process.exit();
    }
  }
}
