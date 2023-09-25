import { Elysia, t } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";
import { randomUUID } from "crypto";
import swagger from "@elysiajs/swagger";

const quiz = ({ name, stage, url, dataKey }: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .use(swagger({path: '/api', documentation: {
    info: {
      title: 'Otus CTF 2023',
      version: '1.11.8',
    }
  }}))
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
      <div class="absolute top-2 right-2 bg-gray-300 px-2 py-1 rounded text-center">
        <span class="block">remaining</span>
        <span>8</span>
      </div>
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
    const data = user.data.get(dataKey) ?? { start: new Date() }
    data.quizzes ??= [];
    let quiz: Quiz = data.quizzes.find((q: Quiz) => q.id == id);
    if(!quiz){
      quiz = {id, answers: []}
      data.quizzes.push(quiz)
    }

    const prevAnswer = quiz.answers[index]
    const quizAnswer = {answer, isCorrect: answer == quizItems[index].correctAnswer};
    if(!prevAnswer){
      quiz.answers[index] = quizAnswer;
    } else {
      if(Array.isArray(quiz.answers[index])){
        quiz.answers.push(quizAnswer);
      } else {
        quiz.answers[index] = [quiz.answers[index] as QuizAnswer];
        (quiz.answers[index] as QuizAnswer[]).push(quizAnswer);
      }
    }

    user.data.set(dataKey, data);

    return html(getQuizItem(url, id, index-1));
  }, {
    body: t.Object({
      id: t.String(),
      index: t.Numeric(),
      answer: t.String(),
    })
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
const getQuizItem = (url: string, id: string = randomUUID(), index: number = quizItems.length - 1, includePost = true) => {
  const quizItem = quizItems[index];
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

export default quiz;