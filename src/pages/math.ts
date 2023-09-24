import { Elysia } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";

const math = ({stage, url}: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())

export default math;