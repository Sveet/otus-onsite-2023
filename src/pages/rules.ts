import { Elysia } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";

const rules = ({ stage, url }: ChallengeParams) => (app: Elysia) => app
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
                    The objective of Capture the Flag is to discover hidden text strings, referred to as "flags", and submit them. It's a challenge that tests your skills and ingenuity.
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

            <!-- FAQ Section -->
            <section class="mb-12">
                <h2 class="text-3xl font-semibold mb-6 text-center text-blue-600 border-b border-blue-400">Frequently Asked Questions</h2>

                <p class="text-blue-800 mb-4 font-bold">Q: How long does the Capture the Flag challenge last?</p>
                <p class="text-blue-800 mb-8">A: The CTF will last the entire the 3-day event. The source code will be published if anyone wants to try again.</p>

                <p class="text-blue-800 mb-4 font-bold">Q: What if I encounter a technical issue during the challenge?</p>
                <p class="text-blue-800 mb-8">A: If you face a technical issue, make sure to talk about it loudly so the server fairies can overhear you. If that doesn't work, post in Slack.</p>

                <p class="text-blue-800 mb-4 font-bold">Q: Can I collaborate with others during the challenge?</p>
                <p class="text-blue-800">A: Collaboration is certainly welcome. However, the true enjoyment comes from the satisfaction of solving the puzzles yourself. Try not to deprive yourself of the fun.</p>
            </section>
        </div>
        <div class="max-w-3xl mx-auto bg-white p-10 rounded-md shadow-lg">
            <button class="bg-green-500 hover:bg-green-600 w-full py-4 text-white font-bold rounded-md">
                Click to Continue
            </button>
        </div>
    </body>
    </html>
    `))

export default rules;