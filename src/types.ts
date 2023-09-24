import { Elysia } from "elysia";

export type User = {
  id: string;
  stage: number;
  data: Map<string, GameData>
  created?: Date;
  updated?: Date;
};

export type GameData = {
  title: string
  [key: string]: any
}

export type ChallengeParams = {
  stage: number;
  url: string;
  handler: (params: ChallengeParams) => (app: Elysia) => Elysia;
}