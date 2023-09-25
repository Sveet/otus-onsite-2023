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
    <body class="bg-gray-200 h-screen flex justify-center items-center relative">
      <!-- Remaining time -->
      <div class="absolute top-2 right-2 bg-gray-300 px-2 py-1 rounded text-center">
        <span class="block">remaining</span>
        <span>8</span>
      </div>
    
      <div class="text-center bg-white p-8 rounded-lg shadow-md w-11/12 h-3/4 flex flex-col">
        <!-- Question content -->
        <h1 class="text-3xl font-bold mb-4 flex-grow-0 flex-shrink-0 h-1/3 flex items-center justify-center">Placeholder Question?</h1>
        
        <!-- Answers content -->
        <div class="grid grid-cols-2 gap-4 flex-grow flex-shrink h-2/3">
          <button class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl">
            <span class="font-bold ml-2">A</span>
            <span class="text-center flex-grow">Placeholder Answer 1</span>
          </button>
          <button class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl">
            <span class="font-bold ml-2">B</span>
            <span class="text-center flex-grow">Placeholder Answer 2</span>
          </button>
          <button class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl">
            <span class="font-bold ml-2">C</span>
            <span class="text-center flex-grow">Placeholder Answer 3</span>
          </button>
          <button class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl">
            <span class="font-bold ml-2">D</span>
            <span class="text-center flex-grow">Placeholder Answer 4</span>
          </button>
        </div>
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
    </html>
    `)
  })
  .post(url, ({ user, html, body }) => {
    return html(getQuizItem())
  }, {
    body: t.Object({
      id: t.Numeric(),
      answer: t.String(),
      remaining: t.Numeric(),
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