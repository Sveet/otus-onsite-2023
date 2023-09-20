import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { createUser, getUser } from "./db";
import login from './login'

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .get("/favicon.ico", () => Bun.file('./public/favicon.ico'))
  .get("/", ({headers, set}) => {
    const userId = headers['X-MAC-ADDRESS']!;
    let user = getUser(userId)
    if(!user) {
      user = {id: userId, stage: 0}
      createUser(user);
    }

    switch(user.stage){
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
  .use(login)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
