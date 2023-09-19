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
    const user = getUser(userId)
    if(user) {
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
    } else {
      createUser({id: userId, stage: 0});
      set.redirect = '/login'
    }
  })
  .get("/login", ({ html }) => html(getLoginPage()))
  .post("/login", ({ set, body, headers }) => {
    const username = (body as any)?.username;
    const password = (body as any)?.password;
    const playedSuccess = (body as any)?.success
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
  .post("/signup", ({ html, body: { remaining } }) => html(getSignup(remaining)), {
    body: t.Object({ remaining: t.Optional(t.Number()) }),
    transform: ({ body }) => { if (body.remaining) body.remaining = +body.remaining }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
