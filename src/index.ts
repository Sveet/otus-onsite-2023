import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { createUser } from "./db";
import { UserPlugin, StageGuard } from "./plugin";
import login from './challenges/login'
import math from "./challenges/math";

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

    switch (user.stage) {
      case 0:
        set.redirect = '/login'
        break;
      case 1:
        set.redirect = '/tos'
        break;
      case 2:
        set.redirect = '/quiz'
        break;
    }
  })
  .use(StageGuard(0)(login(0)))
  .use(StageGuard(1)(math(1)))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
