import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { createUser } from "./db";
import login from './login'
import { UserPlugin } from "./mac";

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
  .use(login(1))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
