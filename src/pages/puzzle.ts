import { Elysia } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";

const puzzle = ({stage, url}: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .get(url, ({html})=>html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Page</title>
  <script src="/public/htmx@1.9.5.min.js"></script>
  <script src="/public/tailwind@3.3.3.min.js"></script>
  <link rel="icon" href="favicon.ico" type="image/x-icon">
</head>
<body>
${getPuzzle()}
</body>
</html>`))
  .post(url, ({html, body})=>html(getPuzzle()))

const getPuzzle = () => ``

export default puzzle;