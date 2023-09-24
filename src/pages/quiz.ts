import { Elysia, t } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";

const quiz = ({ name, stage, url, dataKey }: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .get(url, ({ user, html }) => {
    if(!user.data.has(dataKey)){
      user.data.set(dataKey, { start: new Date() })
      user.save();
    }
    return html(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <script src="/public/htmx@1.9.5.min.js"></script>
    <script src="/public/tailwind@3.3.3.min.js"></script>
    <link rel="icon" href="favicon.ico" type="image/x-icon">
  </head>
  <body class="bg-gray-200 h-screen flex justify-center items-center">
    <div class="text-center bg-white p-8 rounded-lg shadow-md">
      ${getQuizItem()}
    </div>
    <script>
      function playSuccess() {
        const audio = new Audio('public/success.wav');
        audio.play();
      }
      document.body.addEventListener('success', (e)=>{
        playSuccess();
        setTimeout(()=>location.href = '/', 1500);
      })
    </script>
  </body>
  </html>`)
  })
  .post(url, ({ user, html, body }) => {
    return html(getQuizItem())
  }, {
    body: t.Object({
      id: t.Numeric(),
      answer: t.String(),
    })
  })

type QuizItem = {
  id: number;
  question: string;
  answer: string | RegExp
  type: 'choice' | 'text'
}
const quizItems: QuizItem[] = [
]
const getQuizItem = (id?: number = quizItems.length-1) => {
  return ``;
}

export default quiz;