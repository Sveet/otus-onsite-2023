import { Elysia } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";

const math = (stage: number) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())

export default math;