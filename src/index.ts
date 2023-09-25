import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { createUser } from "./db";
import { UserPlugin } from "./plugin";
import admin from './pages/admin'
import login from './pages/login'
import quiz from "./pages/quiz";
import { waiting } from "./pages/waiting";
import { ChallengeParams, User } from "./types";
import rules from "./pages/rules";
import puzzle from "./pages/puzzle";

const challenges: ChallengeParams[] = [
  { stage: 0, minimumTime: (3 * 60 * 1000), url: '/login', dataKey: 'login', name: 'Login', handler: login, scoreRenderer: () => '' },
  { stage: 1, minimumTime: (3 * 60 * 1000), url: '/rules', dataKey: 'rules', name: 'Rules of Engagement', handler: rules, scoreRenderer: () => '' },
  { stage: 2, minimumTime: (3 * 60 * 1000), url: '/puzzle', dataKey: 'puzzle', name: '15 Puzzle', handler: puzzle, scoreRenderer: () => '' },
  { stage: 3, minimumTime: 0, url: '/waiting', dataKey: 'waiting', name: 'Waiting Room', handler: waiting, scoreRenderer: () => '' },
  // { stage: 3, minimumTime: (3 * 60 * 1000), url: '/quiz', dataKey: 'quiz', name: 'Pop Quiz', handler: quiz, scoreRenderer: () => '' },
]

const app = new Elysia()
  .use(UserPlugin())
  .use(staticPlugin())
  .use(html())
  .get("/favicon.ico", () => Bun.file('./public/favicon.ico'))
  .get("/", async ({ set, user, MAC }) => {
    if (!user) {
      user = new User({ id: MAC, stage: 0 })
      createUser(user);
    }
    set.redirect = challenges.find(c => c.stage == user.stage)?.url ?? challenges[0].url
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

app.use(admin('/admin'));
app.all('*', ({ set }) => set.redirect = '/');

console.log(
  `Otus CTF 2023 is running at ${app.server?.hostname}:${app.server?.port}`
);
