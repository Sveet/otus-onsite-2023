import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { createUser } from "./db";
import { UserPlugin, StageGuard } from "./plugin";
import login from './pages/login'
import math from "./pages/math";
import { waiting } from "./pages/waiting";
import { ChallengeParams, User } from "./types";
import rules from "./pages/rules";
import puzzle from "./pages/puzzle";

const challenges: ChallengeParams[] = [
  { stage: 0, url: '/login', handler: login },
  // {stage: 1, url: '/waiting', handler: waiting},
  // { stage: 1, url: '/rules', handler: rules },
  { stage: 1, url: '/puzzle', handler: puzzle },
  { stage: 2, url: '/math', handler: math },
]

const app = new Elysia()
  .use(UserPlugin())
  .use(staticPlugin())
  .use(html())
  .get("/favicon.ico", () => Bun.file('./public/favicon.ico'))
  .get("/", async ({ set, user, MAC }) => {
    if (!user) {
      user = { id: MAC, stage: 0, data: new Map() }
      createUser(user);
    }
    set.redirect = challenges.find(c => c.stage == user!.stage)?.url ?? challenges[0].url
  })
  .listen(3000);

challenges.map(c => {
  app.guard({
    beforeHandle: ({ set, user }) => {
      if (user?.stage != c.stage) {
        set.redirect = '/'
        return 'redirected'
      }
    }
  }, app => app.use(c.handler(c)))
})

app.all('*', ({set})=> set.redirect = '/')

console.log(
  `Otus CTF 2023 is running at ${app.server?.hostname}:${app.server?.port}`
);
