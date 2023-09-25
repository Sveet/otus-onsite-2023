import { Elysia, t } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";
import { randomUUID } from "crypto";
import swagger from "@elysiajs/swagger";

const quiz = ({ name, stage, url, dataKey }: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .use(swagger({
    path: '/api', documentation: {
      info: {
        title: 'Otus CTF 2023',
        version: '1.11.8',
      }
    }
  }))
  .get(url, ({ user, html }) => {
    if (!user.data.has(dataKey)) {
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
      ${getQuizItem(url)}
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
  .post(url, ({ user, html, body: { id, index, answer } }) => {
    index = Number(index);
    const data = user.data.get(dataKey) ?? { start: new Date() }
    data.quizzes ??= [];
    let quiz: Quiz = data.quizzes.find((q: Quiz) => q.id == id);
    if (!quiz) {
      quiz = { id, answers: [] }
      data.quizzes.push(quiz)
    }

    const prevAnswer = quiz.answers[index]
    const quizAnswer = { answer, isCorrect: answer == quizItems[index].correctAnswer };
    if (!prevAnswer) {
      quiz.answers[index] = quizAnswer;
    } else {
      if (Array.isArray(prevAnswer)) {
        prevAnswer.push(quizAnswer);
      } else {
        quiz.answers[index] = [];
        (quiz.answers[index] as QuizAnswer[]).push(prevAnswer);
        (quiz.answers[index] as QuizAnswer[]).push(quizAnswer);
      }
    }

    user.data.set(dataKey, data);
    user.save();

    if (index >= quizItems.length - 1) {
      return html(getQuizComplete(quiz))
    }

    return html(getQuizItem(url, id, index + 1));
  }, {
    body: t.Object({
      id: t.String(),
      index: t.Numeric(),
      answer: t.String(),
    }),
  })

type QuizAnswer = {
  answer: string
  isCorrect: boolean
}
type Quiz = {
  id: string;
  answers: Array<QuizAnswer | QuizAnswer[]>
}
type QuizItem = {
  question: string;
  correctAnswer: string;
  choices: string[];
}
const secretQuizItem: QuizItem = {
  question: "",
  correctAnswer: "asdasdasd",
  choices: ['']
}
const quizItems: QuizItem[] = [
  {
    "question": "How many times does Rick Astley declare he will 'never give you up' in his famous song?",
    "correctAnswer": "c",
    "choices": [
      "0 times",
      "5 times",
      "6 times",
      "8 times"
    ]
  },
  {
    "question": "What does 'HTTP' stand for?",
    "correctAnswer": "d",
    "choices": [
      "HyperText Training Protocol",
      "High Transfer Technology Protocol",
      "Hyperlink and Text Transfer Protocol",
      "HyperText Transfer Protocol"
    ]
  },
  {
    "question": "In the classic Monopoly game, which property is NOT one of the Railroads?",
    "correctAnswer": "d",
    "choices": [
      "Reading Railroad",
      "B. & O. Railroad",
      "Pennsylvania Railroad",
      "Central Avenue"
    ]
  },
  {
    "question": "In object-oriented programming, what does the 'S' in 'SOLID' stand for?",
    "correctAnswer": "b",
    "choices": [
      "Substitution",
      "Single Responsibility Principle",
      "Structure",
      "Segmentation"
    ]
  },
  {
    "question": "Which of these is not a Linux distribution?",
    "correctAnswer": "b",
    "choices": [
      "Gnoppix",
      "Freebase",
      "Gentoo",
      "Neptune"
    ]
  },
  {
    "question": "What does the 'R' in 'REST' stand for?",
    "correctAnswer": "d",
    "choices": [
      "Remote",
      "Request",
      "Response",
      "Representational"
    ]
  },
  {
    "question": "What is the main diet of the Loch Ness Monster?",
    "correctAnswer": "d",
    "choices": [
      "Fish",
      "Humans",
      "Ships",
      "Tourist photos"
    ]
  },
  {
    "question": "Which word completes the phrase: Embrace, Extend, _____?",
    "correctAnswer": "c",
    "choices": [
      "Envelop",
      "Enumerate",
      "Extinguish",
      "Exceed"
    ]
  },
  {
    "question": "Which of these is not a cryptographic algorithm?",
    "correctAnswer": "c",
    "choices": [
      "Twofish",
      "Whirlpool",
      "Mirkwood",
      "Serpent"
    ]
  },
  {
    "question": "What does the 'C' in 'CSS' stand for?",
    "correctAnswer": "b",
    "choices": [
      "Compute",
      "Cascading",
      "Code",
      "Compile"
    ]
  }
]
const getQuizItem = (url: string, id: string = randomUUID(), index: number = 0, includePost = true) => {
  const quizItem = quizItems[index];
  console.log(`quizItem typeof index ${typeof index} ${index} ${JSON.stringify(quizItem)} from ${JSON.stringify(quizItems)}`)
  return `
  <form class="text-center bg-white p-8 rounded-lg shadow-md w-11/12 h-3/4 flex flex-col">
    <!-- Question content -->
    <h1 class="text-3xl font-bold mb-4 flex-grow-0 flex-shrink-0 h-1/3 flex items-center justify-center">${quizItem.question}</h1>
    
    <!-- Answers content -->
    <div class="grid grid-cols-2 gap-4 flex-grow flex-shrink h-2/3">
      <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl" ${includePost ? `hx-vals='js:{"answer": "a", "id": "${id}", "index": ${index}}' hx-post="${url}" hx-swap="outerHTML" hx-target="closest form"` : ''}>
        <span class="font-bold ml-2">A</span>
        <span class="text-center flex-grow">${quizItem.choices[0]}</span>
      </button>
      <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl" ${includePost ? `hx-vals='js:{"answer": "b", "id": "${id}", "index": ${index}}' hx-post="${url}" hx-swap="outerHTML" hx-target="closest form"` : ''}>
        <span class="font-bold ml-2">B</span>
        <span class="text-center flex-grow">${quizItem.choices[1]}</span>
      </button>
      <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl" ${includePost ? `hx-vals='js:{"answer": "c", "id": "${id}", "index": ${index}}' hx-post="${url}" hx-swap="outerHTML" hx-target="closest form"` : ''}>
        <span class="font-bold ml-2">C</span>
        <span class="text-center flex-grow">${quizItem.choices[2]}</span>
      </button>
      <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex justify-between items-center text-xl" ${includePost ? `hx-vals='js:{"answer": "d", "id": "${id}", "index": ${index}}' hx-post="${url}" hx-swap="outerHTML" hx-target="closest form"` : ''}>
        <span class="font-bold ml-2">D</span>
        <span class="text-center flex-grow">${quizItem.choices[3]}</span>
      </button>
    </div>
  </form>`;
}
const getQuizComplete = (quiz: Quiz) => `<div class="text-center bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center">
<!-- Success message -->
<h1 class="text-3xl font-bold mb-4">Quiz Complete!</h1>

<button class="mb-4 p-2 text-center text-white hover:bg-green-600 bg-green-500 rounded-lg border-2" onClick="location.reload()">Play Again?</button>

<!-- Score -->
<p class="text-2xl mb-6">Score: ${quiz.answers.filter(a => Array.isArray(a) ? a[a.length-1].isCorrect : a.isCorrect).length}/${quizItems.length}</p>

<!-- Quiz results -->
<div class="grid grid-cols-5 gap-4 mb-4 w-full">
  ${quiz.answers.map((a, i) => renderAnswer(i, a)).join('')}
</div>
</div>
`

const renderAnswer = (index: number, a: QuizAnswer | QuizAnswer[]) => {
  const lastAnswer = Array.isArray(a) ? a[a.length - 1] : a;
  console.log(`renderAnswer ${index} lastAnswer ${JSON.stringify(lastAnswer)} from ${JSON.stringify(a)}`)
  return lastAnswer.isCorrect ?
    `<div class="bg-green-500 text-white p-2 rounded-full text-center w-10 h-10 flex items-center justify-center">${lastAnswer.answer}</div>`
    : `<div class="bg-red-500 text-white p-2 rounded-full text-center w-10 h-10 flex items-center justify-center relative group">
    ${lastAnswer.answer}
    <span class="absolute top-0 left-0 w-full h-full bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">${quizItems[index]?.correctAnswer}</span>
  </div>`;
}

export default quiz;