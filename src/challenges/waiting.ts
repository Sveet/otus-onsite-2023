import { Elysia } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";

export const waiting = ({stage, url}: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .guard({beforeHandle: ({set, user})=>{
    if(user?.stage != stage){
      set.redirect = '/'
      return 'redirected'
    }
  }}, app => app
    .use(html())
    .get(url, ({html}) => html(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hang on ...</title>
        <script src="/public/htmx@1.9.5.min.js"></script>
        <script src="/public/tailwind@3.3.3.min.js"></script>
        <link rel="icon" href="favicon.ico" type="image/x-icon">
    </head>
    <body class="bg-gray-100 h-screen flex justify-center items-center">
        <div class="text-center bg-white p-8 rounded-lg shadow-md">
            <p class="text-lg">Thanks for playing! You're ahead of the curve. Stay tuned for the rest of the challenge.</p>
        </div>
    </body>
    </html>
    `))
  )