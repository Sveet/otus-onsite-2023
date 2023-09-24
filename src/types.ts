import { Elysia } from "elysia";
import { upsertUser } from "./db";

export class User {
  id: string;
  stage: number;
  data: Map<string, StageData>
  created?: Date;
  updated?: Date;

  constructor(u: Omit<User, 'save' | 'advance'>){
    this.id = u.id;
    this.stage = u.stage;
    this.data = typeof u.data == 'string' ? new Map(JSON.parse(u.data)) : Array.isArray(u.data) ? new Map(u.data) : u.data;
    this.created = u.created;
    this.updated = u.updated;
  }

  save(){
    upsertUser(this);
  }

  advance(stage: number, dataKey: string){
    this.stage = stage+1;
    const data = this.data.get(dataKey)!
    data.end = new Date();
    data.cheatFactor = Math.max((data.minimum - (data.end.getTime() - data.start.getTime())) / 1000, 0)
    this.save();
  }
};

export type StageData = {
  start: Date
  end?: Date
  minimum: number
  cheatFactor?: number
  [key: string]: any
}

export type ChallengeParams = {
  stage: number;
  url: string;
  dataKey: string;
  name: string;
  handler: (params: ChallengeParams) => (app: Elysia) => Elysia;
  scoreRenderer: (data: StageData) => string
}