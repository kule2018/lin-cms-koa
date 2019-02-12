import { Redprint } from "../../../lin/redprint";
import { LogFindForm } from "../../validators/forms";
import { paginate } from "../../../lin/util";
import { Log } from "../../../lin/core";
import { set, get } from "lodash";
import { /*getConnection*/ getRepository, Between, Like } from "typeorm";
import { NotFound, ParametersException } from "../../../lin/exception";
import { groupRequired } from "../../../lin/jwt";
const log = new Redprint({
  prefix: "/log"
});

log.redGet(
  "getLogs",
  "/",
  { auth: "查询所有日志", module: "日志", mount: true },
  groupRequired,
  async ctx => {
    const form = new LogFindForm(ctx).validate();
    const { start, count } = paginate(ctx);
    let condition = {};
    form.name && set(condition, "name", form.name);
    const [logs, total] = await Log.findAndCount({
      where: {
        ...condition,
        _time: Between(form.start, form.end)
      },
      skip: start,
      take: count,
      order: {
        _time: "DESC"
      }
    });
    if (total < 1) {
      throw new NotFound({ msg: "没有找到相关日志" });
    }
    ctx.json({
      total_nums: total,
      collection: logs
    });
  }
);

log.redGet(
  "getUserLogs",
  "/search",
  { auth: "搜索日志", module: "日志", mount: true },
  groupRequired,
  async ctx => {
    const keyword = get(ctx.request.query, "keyword");
    if (!keyword || keyword === "") {
      throw new ParametersException({ msg: "搜索关键字不可为空" });
    }
    const form = new LogFindForm(ctx).validate();
    const { start, count } = paginate(ctx);
    let condition = {};
    form.name && set(condition, "name", form.name);
    const [logs, total] = await Log.findAndCount({
      where: {
        ...condition,
        _time: Between(form.start, form.end),
        message: Like(`%${keyword}%`)
      },
      skip: start,
      take: count,
      order: {
        _time: "DESC"
      }
    });
    if (total < 1) {
      throw new NotFound({ msg: "没有找到相关日志" });
    }
    ctx.json({
      total_nums: total,
      collection: logs
    });
  }
);

log.redGet(
  "getUsers",
  "/users",
  { auth: "查询日志记录的用户", module: "日志", mount: true },
  groupRequired,
  async ctx => {
    const { start, count } = paginate(ctx);
    const userNames = await getRepository(Log)
      .createQueryBuilder("log")
      .select("log.user_name")
      .groupBy("log.user_name")
      .andHaving("count(log.user_name) > 0")
      // .addSelect("SUM(user.photosCount)", "sum")
      .skip(start)
      .take(count)
      .getRawMany();
    ctx.json({
      userNames
    });
  }
);

export { log };
