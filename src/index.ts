import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { getLoginPage, getSignup, validateLogin } from "./login";
import { User, createUser, getUser, upsertUser } from "./db";

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
        set.redirect = '/quiz'
        break;
      case 2:
        break;
    }
  })
  .get("/login", ({ html }) => html(getLoginPage()))
  .post("/login", ({ set, body, headers }) => {
    const username = (body as any)?.username;
    const password = (body as any)?.password;
    if(!validateLogin(username, password)){
      set.headers = { 'HX-Trigger': 'failedLogin' }
    } else {
      const user: User = {
        id: headers['X-MAC-ADDRESS']!,
        stage: 1
      }
      upsertUser(user);
      set.headers = { 'HX-Trigger': 'successfulLogin' }
    }
  })
  .post("/signup", ({ html, body: { remaining } }) => html(getSignup(remaining ?? (Math.floor(Math.random() * 10)+5))), {
    body: t.Object({ remaining: t.Optional(t.Number()) }),
    transform: ({ body }) => { if (body.remaining) body.remaining = +body.remaining }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
