import { Elysia, t } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams, StageData } from "../types";
import { getAllUsers } from "../db";
const ALLOWED_MACs = [
  '88:66:5a:45:65:53',
  'a2:ae:25:9f:1b:1a'
]
const admin = (url: string) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .get(`${url}/json`, async () => {
    const temp = await temp_C();
    const users = getAllUsers();
    return {
      temp,
      users: users.map((u) => {
        (u.data as any) = JSON.stringify(Array.from(u.data.entries()))
      })
    }
  },
  {
    beforeHandle: ({ MAC, set }) => {
      if (MAC != "" && !ALLOWED_MACs.includes(MAC.trim())) {
        console.error(`Attempt to access admin panel from ${MAC}`);
        set.redirect = '/'
        return 'redirected'
      }
    }
  })
  .get(url, async ({ html }) => {
    return html(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <script src="/public/htmx@1.9.5.min.js"></script>
    <script src="/public/tailwind@3.3.3.min.js"></script>
    <link rel="icon" href="favicon.ico" type="image/x-icon">
  </head>
  <body class="bg-gray-200 h-screen flex justify-center items-center">
    ${await adminPanel()}
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
  }, {
    beforeHandle: ({ MAC, set }) => {
      if (MAC != "" && !ALLOWED_MACs.includes(MAC.trim())) {
        console.error(`Attempt to access admin panel from ${MAC}`);
        set.redirect = '/'
        return 'redirected'
      }
    }
  })
  .post(url,
    async ({ html }) => html(await adminPanel()),
    {
      beforeHandle: ({ MAC, set }) => {
        if (MAC != "" && !ALLOWED_MACs.includes(MAC.trim())) {
          console.error(`Attempt to access admin panel from ${MAC}`);
          set.redirect = '/'
          return 'redirected'
        }
      }
    })

const adminPanel = async () => {
  const temp = await temp_C();
  const allUsers = getAllUsers();
  const userPanels = allUsers.map(u => `
<div class="border p-4 rounded">
    <p><strong>ID:</strong> <span id="userId">${u.id}</span></p>
    <p><strong>Stage:</strong> <span id="userStage">${u.stage}</span></p>
    <p class="mt-2"><strong>Created:</strong> <span id="userCreated">${u.created}</span></p>
    <p><strong>Updated:</strong> <span id="userUpdated">${u.updated}</span></p>
    
    <details class="mt-2">
        <summary class="cursor-pointer text-blue-500 hover:underline">Data</summary>
        ${renderData(u.data)}
    </details>
</div>
  `)
  return `
    ${temp ? `<div class="mt-4 border-2 border-blue text-lg">
      ${temp}
    </div>` : ''}
    ${userPanels.join('')}
  `
}

const renderData = (data: any): string => typeof data == 'object' ? (data instanceof Map ?
  Array.from(data.entries()) : Object.entries(data)).map(
    ([key, value]) => typeof value === 'object' && value !== null ? `
    <details class="mt-2">
        <summary class="cursor-pointer text-blue-500 hover:underline">${key}</summary>
        <div class="pl-4 mt-2">
            ${renderData(value)}
        </div>
    </details>` : `<p><strong>${key}:</strong> ${value}</p>`)
    .join('') : data;

const temp_C = async () => {
  try {
    const tempString = await new Response(Bun.spawn(['vcgencmd', 'measure_temp',]).stdout).text();
    return tempString.split("=")?.[1]
  } catch (err) {
    console.debug(`cannot get temp_C. ${JSON.stringify(err)}`)
  }
}

export default admin;