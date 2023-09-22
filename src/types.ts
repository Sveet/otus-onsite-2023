import {Elysia} from "elysia";

export type User = {
  id: string;
  stage: number;
  created?: Date;
  updated?: Date;
};

export type ChallengeParams = {
  stage: number;
  url: string;
  handler?: (params: ChallengeParams) => (app: Elysia) => Elysia;
}