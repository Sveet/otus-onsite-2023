import { Elysia, t } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams, GameData } from "../types";
import { swagger } from '@elysiajs/swagger'
import { randomUUID } from "crypto";

const rules = ({ stage, url }: ChallengeParams) => (app: Elysia) => app
  .use(swagger({path: '/api'}))
  .use(UserPlugin())
  .use(html())
  .get(url, ({ html }) => html(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rules of Engagement</title>
        <script src="/public/htmx@1.9.5.min.js"></script>
        <script src="/public/tailwind@3.3.3.min.js"></script>
        <link rel="icon" href="favicon.ico" type="image/x-icon">
    </head>
    <body class="bg-gray-200 py-20 text-lg">
        <div class="max-w-3xl mx-auto bg-white p-10 rounded-md shadow-lg mb-10">
            <section class="mb-12">
                <h2 class="text-3xl font-semibold mb-6 text-center text-blue-600 border-b border-blue-400">How to Play</h2>
                <p class="text-blue-800 mb-4">
                    The objective of Capture the Flag is usually to discover hidden text strings, referred to as "flags", in vulnerable software.
                </p>
            </section>

            <section class="mb-12">
                <h2 class="text-3xl font-semibold mb-6 text-center text-blue-600 border-b border-blue-400">Recommended Approaches</h2>
                <ul class="list-disc pl-5 text-blue-800">
                    <li class="mb-3">Have fun and enjoy the challenge. Getting stuck is part of the fun.</li>
                    <li class="mb-3">Make effective use of the developer console to inspect elements and debug.</li>
                    <li class="mb-3">You can employ tools like Postman or curl, or any other tool you are comfortable with, to make requests and analyze responses.</li>
                    <li>Use all of your ingenuity and technical expertise.</li>
                </ul>
            </section>

            <section class="mb-12">
                <h2 class="text-3xl font-semibold mb-6 text-center text-blue-600 border-b border-blue-400">Things to Avoid</h2>
                <ul class="list-disc pl-5 text-blue-800">
                    <li class="mb-3">Please do not attempt to disrupt the CTF (eg, DDOS attack).</li>
                    <li>Ensure your actions do not negatively impact the experience for others.</li>
                </ul>
            </section>

            <section class="mb-12">
                <h2 class="text-3xl font-semibold mb-6 text-center text-blue-600 border-b border-blue-400">Frequently Asked Questions</h2>

                <p class="text-blue-800 mb-4 font-bold">Q: How long does the Capture the Flag challenge last?</p>
                <p class="text-blue-800 mb-8">A: The CTF will last the entire the 3-day event. The source code will be published if anyone wants to play after that.</p>

                <p class="text-blue-800 mb-4 font-bold">Q: What if I encounter a technical issue during the challenge?</p>
                <p class="text-blue-800 mb-8">A: If you face a technical issue, talk about it loudly so the server fairies can overhear you. If that doesn't work, post in Slack.</p>

                <p class="text-blue-800 mb-4 font-bold">Q: Can I collaborate with others during the challenge?</p>
                <p class="text-blue-800">A: Collaboration is certainly welcome. However, the true enjoyment comes from the satisfaction of solving the puzzles yourself. Try not to deprive yourself of the fun.</p>
            </section>
        </div>
        ${/*getForm(url, randomUUID())*/''}
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
        console.log('Hint: Sometimes the API exposes more than it should. Have you checked out our swagger? https://10.0.0.1/api')
      </script>
    </body>
    </html>
    `))
  .post(url, ({ html, user, body: { remaining, ...inputs } }) => {
    if (!remaining) remaining = 4
    const data: { title: string, submissions: FormInputs[] } = user.data.get('rule-submissions') as any ?? { title: 'Rules of Engagement Waiver', submissions: [] };
    const submission = data.submissions.find(s => s.sub_id == inputs.sub_id)
    if (!submission) {
      data.submissions.push(inputs)
    } else {
      submission.name = inputs.name
      submission.email = inputs.email
      submission.color = inputs.color
      submission.found = inputs.found
    }
    user.data.set('rule-submissions', data);

    return html(getForm(url, inputs.sub_id, remaining, inputs))
  }, {
    body: t.Optional(t.Object({
      remaining: t.Optional(t.Numeric()),
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
      color: t.Optional(t.String()),
      found: t.Optional(t.String()),
      sub_id: t.String(),
    }))
  })

type FormInputs = {
  sub_id: string
  name?: string
  email?: string
  color?: string
  found?: string
}
const getForm = (url: string, submissionId: string, remaining?: number, inputs?: FormInputs) => `
<div class="max-w-3xl mx-auto bg-white p-10 rounded-md shadow-lg">
  <form hx-post="${url}" hx-target="closest div" hx-swap="outerHTML" hx-vals='js:{"sub_id": "${submissionId}"${remaining ? `, "remaining": ${remaining - 1}` : ''}}'>
      ${getContinue(remaining)}
      ${getInputs(remaining, inputs)}
  </form>
</div>`
const getContinue = (remaining?: number) => {
  if (!remaining) return `
  <button type="submit" class="mb-4 bg-green-500 hover:bg-green-600 w-full py-4 text-white font-bold rounded-md">
      Click to Continue
  </button>`

  return `
  <div class="flex items-center justify-between mt-4">
      <!-- Submit Button -->
      <button type="submit" class="bg-blue-500 hover:bg-blue-600 flex-grow py-4 text-white font-bold rounded-md">
          Click to Continue
      </button>

      <!-- Attempts Div -->
      <div class="ml-4 w-20 h-20 bg-gray-300 flex flex-col justify-center items-center rounded-md">
          <span class="text-xs text-blue-700">Attempts</span>
          <span class="text-blue-800 font-bold">${remaining}</span>
      </div>
  </div>`
}

const getInputs = (remaining?: number, inputs?: FormInputs) => {
  if (!remaining) return ``

  const elements = [
    `<!-- Name Input -->
    <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-blue-700">Name:</label>
        <input ${inputs?.name ? `value="${inputs.name}" ` : ''}type="text" name="name" id="name" required class="mt-1 p-2 w-full border rounded-md border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200" placeholder="Enter your name">
        ${inputs?.name ? '' : '<span class="text-red-600 text-xs">Please enter your name.</span>'}
    </div>`,
    `<!-- Email Input -->
    <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-blue-700">Email:</label>
        <input ${inputs?.email ? `value="${inputs.email}" ` : ''}type="email" name="email" id="email" required class="mt-1 p-2 w-full border rounded-md border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200" placeholder="Enter your email">
        ${inputs?.email ? '' : '<span class="text-red-600 text-xs">Please enter a valid email.</span>'}
    </div>`,
    `<!-- Color Selection -->
    <div class="mb-4">
        <label for="color" class="block text-sm font-medium text-blue-700">Select a color:</label>
        <select name="color" id="color" required class="mt-1 p-2 w-full border rounded-md border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
            <option value="" disabled selected>Select a color</option>
            <option value="red"${inputs?.color == 'red' ? ` selected` : ''}>Red</option>
            <option value="blue"${inputs?.color == 'blue' ? ` selected` : ''}>Blue</option>
            <option value="green"${inputs?.color == 'green' ? ` selected` : ''}>Green</option>
        </select>
        ${inputs?.color ? '' : '<span class="text-red-600 text-xs">Please select a color.</span>'}
    </div>`,
    `<!-- Flag Found Selection -->
    <div class="mb-4">
        <span class="block text-sm font-medium text-blue-700">Have you found the flag?</span>
        <div class="mt-2">
            <label class="inline-flex items-center mr-4">
                <input type="radio" name="foundFlag" value="yes" required class="form-radio text-blue-600"${inputs?.found == 'yes' ? ` checked` : ''}>
                <span class="ml-2 text-blue-700">Yes</span>
            </label>
            <label class="inline-flex items-center">
                <input type="radio" name="foundFlag" value="no" required class="form-radio text-blue-600"${inputs?.found == 'no' ? ` checked` : ''}>
                <span class="ml-2 text-blue-700">No</span>
            </label>
        </div>
        ${inputs?.found ? '' : '<span class="text-red-600 text-xs block mt-2">Please indicate if you have found the flag.</span>'}
    </div>`
  ]

  for (let i = 0; i < remaining - 1; i++) elements.pop();

  return elements.join('\n')
}

export default rules;