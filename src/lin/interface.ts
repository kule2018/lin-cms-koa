import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { UserSuper, UserActive } from "./enums";
import dayjs from "dayjs";
import { verify, generate } from "./passwordHash";

export class InfoCrud extends BaseEntity {
  @CreateDateColumn({ name: "create_time", type: "timestamp" })
  _createTime!: Date;

  @UpdateDateColumn({ name: "update_time", type: "timestamp" })
  updateTime!: Date;

  @Column({ name: "delete_time", type: "timestamp", default: null })
  deleteTime!: Date;

  public get createTime(): number {
    return dayjs(this._createTime).unix();
  }

  /**
   * soft_delete 软删除
   */
  public softDelete() {
    // 设置deleteTime为now
    this.deleteTime = new Date();
    // 更新数据库
    this.save();
  }
}

@Entity({ name: "lin_user" })
export class UserInterface extends InfoCrud {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 24, nullable: false, unique: true })
  nickname!: string;

  @Column({ type: "smallint", nullable: false, default: 1 })
  super!: number;

  @Column({ type: "smallint", nullable: false, default: 1 })
  active!: number;

  @Column({ length: 100, unique: true, nullable: true })
  email!: string;

  @Column({ name: "group_id", type: "int", nullable: true })
  groupId!: number;

  @Column({ name: "password", type: "varchar", length: 100 })
  _password!: string;

  public get password(): string {
    return this._password;
  }

  public set password(password: string) {
    this._password = generate(password);
  }

  public get isSuper(): boolean {
    return this.super === UserSuper.SUPER;
  }

  public get isActive(): boolean {
    return this.active === UserActive.ACTIVE;
  }

  public static verify(nickname: string, password: string) {
    throw new Error("must implement this method");
  }

  public checkPassword(raw: string) {
    if (!this._password || this._password === "") {
      return false;
    }
    return verify(raw, this._password);
  }

  public resetPassword(newPassword: string) {
    throw new Error("must implement this method");
  }

  public changePassword(oldPassword: string, newPassword: string) {
    throw new Error("must implement this method");
  }
}

@Entity({ name: "lin_auth" })
export class AuthInterface extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "group_id", type: "int", nullable: false })
  groupId!: number;

  @Column({ type: "varchar", length: 60 })
  auth!: string;

  @Column({ type: "varchar", length: 50 })
  module!: string;
}

@Entity({ name: "lin_group" })
export class GroupInterface extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 60 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  info!: string;
}

@Entity({ name: "lin_log" })
export class LogInterface extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 450 })
  message!: string;

  @CreateDateColumn({ name: "time", type: "timestamp" })
  _time!: Date;

  @Column({ name: "user_id", type: "int", nullable: false })
  userId!: number;

  @Column({ name: "user_name", type: "varchar", length: 20 })
  userName!: string;

  @Column({ name: "status_code", type: "int" })
  statusCode!: number;

  @Column({ type: "varchar", length: 20 })
  method!: string;

  @Column({ type: "varchar", length: 50 })
  path!: string;

  @Column({ type: "varchar", length: 100 })
  authority!: string;

  public get time(): number {
    return dayjs(this._time).unix();
  }
}

@Entity({ name: "lin_event" })
export class EventInterface extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "group_id", type: "int", nullable: false })
  groupId!: number;

  @Column({ name: "message_events", type: "varchar", length: 250 })
  messageEvents!: string;
}
