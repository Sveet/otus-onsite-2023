import { Elysia } from "elysia";
import { deserializeMap, upsertUser } from "./db";

export type IUser = {
  id: string
  stage: number | string
  data?: string
  created?: string
  updated?: string
}
export class User {
  id: string;
  stage: number;
  data: Map<string, StageData>
  created?: Date;
  updated?: Date;

  constructor(u: IUser) {
    this.id = u.id;
    this.stage = +u.stage;
    this.data = typeof u.data == 'string' ? deserializeMap(u.data) : u.data ?? new Map();
    this.created = new Date(u.created ?? Date.now());
    this.updated = new Date(u.updated ?? Date.now());
  }

  save() {
    upsertUser(this);
  }

  advance(stage: number, dataKey: string) {
    console.log(`advancing user: ${JSON.stringify(this)} data: ${JSON.stringify(Array.from(this.data.entries()))}`)
    this.stage = stage + 1;
    const data = this.data.get(dataKey)!
    data.end = new Date();
    data.start = new Date(data.start);
    data.cheatFactor = Math.max((data.minimum - (data.end.getTime() - data.start.getTime())) / 1000, 0)
    this.save();
  }
};

export type StageData = {
  start: Date
  end?: Date
  cheatFactor?: number
  [key: string]: any
}

export type ChallengeParams = {
  stage: number;
  url: string;
  dataKey: string;
  name: string;
  minimumTime: number
  handler: (params: ChallengeParams) => (app: Elysia) => Elysia;
  scoreRenderer: (data: StageData) => string
}