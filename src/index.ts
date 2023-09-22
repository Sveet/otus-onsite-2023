import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { createUser } from "./db";
import { UserPlugin, StageGuard } from "./plugin";
import login from './challenges/login'
import math from "./challenges/math";
import { waiting } from "./challenges/waiting";
import { ChallengeParams } from "./types";

const challenges: ChallengeParams[] = [
  {stage: 0, url: '/login', handler: login},
  {stage: 1, url: '/waiting', handler: waiting},
  {stage: 2, url: '/login', handler: math},
]

const app = new Elysia()
  .use(UserPlugin())
  .use(staticPlugin())
  .use(html())
  .get("/favicon.ico", () => Bun.file('./public/favicon.ico'))
  .get("/", async ({ set, user, MAC }) => {
    if (!user) {
      user = { id: MAC, stage: 0 }
      createUser(user);
    }
    set.redirect = challenges.find(c => c.stage == user!.stage)?.url ?? challenges[0].url
  })
  .listen(3000);

challenges.map(c => {
  if(c?.handler) app.use(c.handler(c))
})

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
