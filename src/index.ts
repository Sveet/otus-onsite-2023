import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { getLoginPage, getSignup } from "./login";

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .get("/", ({ html }) => html(getLoginPage()))
  .post("/login", () => {
    return new Response(JSON.stringify({}), { headers: { 'HX-Trigger': 'failedLogin' } })
  })
  .post("/signup", ({ html, body: { remaining } }) => {
    console.log(`remaining ${typeof remaining} ${remaining}`)
    return html(getSignup(remaining))
  }, { body: t.Object({ remaining: t.Optional(t.Number()) }), transform: ({ body }) => { if (body.remaining) body.remaining = +body.remaining } })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
