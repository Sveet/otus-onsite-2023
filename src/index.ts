import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"
import { getLoginPage } from "./login";

const app = new Elysia()
.use(staticPlugin())
.use(html())
.get("/", ({ html }) => html(getLoginPage()))
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
