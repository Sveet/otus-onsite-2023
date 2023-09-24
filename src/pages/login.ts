import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { upsertUser } from "../db";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";

const login = ({ stage, url }: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .get(url, ({ html }) => html(getLoginPage()))
  .post(url, ({ set, body, user }) => {
    const username = (body as any)?.username;
    const password = (body as any)?.password;
    if (!validateLogin(username, password)) {
      set.headers = { 'HX-Trigger': 'failedLogin' }
    } else {
      user.stage = stage + 1
      upsertUser(user);
      set.headers = { 'HX-Trigger': 'successfulLogin' }
    }
  })
  .post("/signup", ({ html, body: { remaining } }) => html(getSignup(remaining ?? (Math.floor(Math.random() * 10) + 5))), {
    body: t.Object({ remaining: t.Optional(t.Numeric()) }),
  })
export default login;

const getLoginPage = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Page</title>
  <script src="/public/htmx@1.9.5.min.js"></script>
  <script src="/public/tailwind@3.3.3.min.js"></script>
  <link rel="icon" href="favicon.ico" type="image/x-icon">
  <style>
    .flash {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: white;
      z-index: 9999;
      opacity: 1;
      display: none;
    }

    @keyframes floatUp {
      0% {
        transform: translateY(0) translateX(0);
        opacity: 1;
      }
      25% {
        transform: translateY(-15vh) translateX(7vw);
      }
      50% {
        transform: translateY(-30vh) translateX(-7vw);
      }
      75% {
        transform: translateY(-45vh) translateX(7vw);
      }
      100% {
        transform: translateY(-100vh) translateX(0);
        opacity: 0;
      }
    }
    .float-away {
      animation: floatUp 8s forwards;
    }

  </style>
</head>
<body class="bg-gray-200 h-screen flex justify-center items-center">

<div class="flash" id="flashEffect"></div>

<form class="bg-white p-8 rounded-lg shadow-md w-96">
  <div id="logo" class="flex justify-center mb-6">
    <img src="public/otus-logo.png" alt="Logo" class="h-16">
  </div>
  <div class="mb-4">
    <label for="username" class="block text-sm font-medium text-gray-600 mb-2">Username</label>
    <input type="text" id="username" name="username" class="p-2 w-full border rounded-md">
  </div>
  <div class="mb-4">
    <label for="password" class="block text-sm font-medium text-gray-600 mb-2">Password</label>
    <input type="password" id="password" name="password" class="p-2 w-full border rounded-md">
  </div>
  <div class="mb-4">
    <button type="submit" hx-post="/login" hx-swap="none" class="bg-blue-500 text-white w-full p-2 rounded-md hover:bg-blue-600">Login</button>
  </div>
  <div class="text-center">
    <button type="button" hx-post="/signup" hx-target="closest body" hx-params="none" class="text-blue-500 hover:underline">Signup</button>
  </div>
</form>

<script>
  function playThunder() {
    // Flash effect
    const flash = document.getElementById('flashEffect');
    flash.style.display = 'block';
    setTimeout(() => {
      flash.style.display = 'none';
    }, 100);

    const audio = new Audio('public/thunder.wav');
    audio.play();
  }
  function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  }
  document.body.addEventListener('failedLogin', (e)=>{
    playThunder();
    clearForm();
  })
  function playSuccess() {
    const audio = new Audio('public/success.wav');
    audio.play();
  }
  function playToink() {
    const audio = new Audio('public/toink.mp3');
    audio.volume = 0.25;
    audio.play();
  }
  document.body.addEventListener('successfulLogin', (e)=>{
    playSuccess();
    setTimeout(()=>location.href = '/', 1500);
  })
  document.getElementById('logo').addEventListener('click', function() {
    this.classList.add('float-away');
    setTimeout(()=>playToink(), 2100)
    setTimeout(()=>playToink(), 4100)
    setTimeout(()=>this.classList.remove('float-away'), 16000)
  })
  console.log(\`
   ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄         ▄  ▄▄▄▄▄▄▄▄▄▄▄ 
  ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌       ▐░▌▐░░░░░░░░░░░▌
  ▐░█▀▀▀▀▀▀▀█░▌ ▀▀▀▀█░█▀▀▀▀ ▐░▌       ▐░▌▐░█▀▀▀▀▀▀▀▀▀ 
  ▐░▌       ▐░▌     ▐░▌     ▐░▌       ▐░▌▐░▌          
  ▐░▌       ▐░▌     ▐░▌     ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄▄▄ 
  ▐░▌       ▐░▌     ▐░▌     ▐░▌       ▐░▌▐░░░░░░░░░░░▌
  ▐░▌       ▐░▌     ▐░▌     ▐░▌       ▐░▌ ▀▀▀▀▀▀▀▀▀█░▌
  ▐░▌       ▐░▌     ▐░▌     ▐░▌       ▐░▌          ▐░▌
  ▐░█▄▄▄▄▄▄▄█░▌     ▐░▌     ▐░█▄▄▄▄▄▄▄█░▌ ▄▄▄▄▄▄▄▄▄█░▌
  ▐░░░░░░░░░░░▌     ▐░▌     ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌
   ▀▀▀▀▀▀▀▀▀▀▀       ▀       ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀ 
                                                      
   ▄▄▄▄▄▄▄▄▄▄▄       ▄▄▄▄▄▄▄▄▄▄▄       ▄▄▄▄▄▄▄▄▄▄▄    
  ▐░░░░░░░░░░░▌     ▐░░░░░░░░░░░▌     ▐░░░░░░░░░░░▌   
  ▐░█▀▀▀▀▀▀▀▀▀       ▀▀▀▀█░█▀▀▀▀      ▐░█▀▀▀▀▀▀▀▀▀    
  ▐░▌                    ▐░▌          ▐░▌             
  ▐░▌                    ▐░▌          ▐░█▄▄▄▄▄▄▄▄▄    
  ▐░▌                    ▐░▌          ▐░░░░░░░░░░░▌   
  ▐░▌                    ▐░▌          ▐░█▀▀▀▀▀▀▀▀▀    
  ▐░▌                    ▐░▌          ▐░▌             
  ▐░█▄▄▄▄▄▄▄▄▄           ▐░▌          ▐░▌             
  ▐░░░░░░░░░░░▌          ▐░▌          ▐░▌             
   ▀▀▀▀▀▀▀▀▀▀▀            ▀            ▀              
                                                      
   ▄▄▄▄▄▄▄▄▄▄▄   ▄▄▄▄▄▄▄▄▄   ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄ 
  ▐░░░░░░░░░░░▌ ▐░░░░░░░░░▌ ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌
   ▀▀▀▀▀▀▀▀▀█░▌▐░█░█▀▀▀▀▀█░▌ ▀▀▀▀▀▀▀▀▀█░▌ ▀▀▀▀▀▀▀▀▀█░▌
            ▐░▌▐░▌▐░▌    ▐░▌          ▐░▌          ▐░▌
            ▐░▌▐░▌ ▐░▌   ▐░▌          ▐░▌ ▄▄▄▄▄▄▄▄▄█░▌
   ▄▄▄▄▄▄▄▄▄█░▌▐░▌  ▐░▌  ▐░▌ ▄▄▄▄▄▄▄▄▄█░▌▐░░░░░░░░░░░▌
  ▐░░░░░░░░░░░▌▐░▌   ▐░▌ ▐░▌▐░░░░░░░░░░░▌ ▀▀▀▀▀▀▀▀▀█░▌
  ▐░█▀▀▀▀▀▀▀▀▀ ▐░▌    ▐░▌▐░▌▐░█▀▀▀▀▀▀▀▀▀           ▐░▌
  ▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄█░█░▌▐░█▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄█░▌
  ▐░░░░░░░░░░░▌ ▐░░░░░░░░░▌ ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌
   ▀▀▀▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀▀▀▀   ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀ 
                                                      \`);
console.log('WW91IGhhdmUgZG9uZSB3ZWxsIHRvIGdldCB0aGlzIGZhci4gZFhObGNtNWhiV1U2SUhWdWNuVm1abXhsWkMxamFHOXZjMlZ5SUhCaGMzTjNiM0prT2lCemFXeHNhVzVsYzNNdGNtVndZWGxwYm1jSwo=');
</script>
</body>
</html>
`

const getSignup = (remaining: number = 13, dropRate_ms: number = 6000, jitter_ms: number = 4500) => {
  const jitterDirection = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
  const delay = dropRate_ms + (jitter_ms * Math.random() * jitterDirection);

  return remaining > 0 ? `
    <div class="bg-white p-8 rounded-lg shadow-md w-96" hx-trigger="load delay:${delay}ms" hx-swap="outerHTML" hx-post="/signup" hx-vals="js:{remaining: ${remaining - 1}}">
      <div class="text-center text-xl mb-4">Waiting in line...</div>
      <div id="counter" class="text-center text-3xl mb-4">${remaining}</div>
      <div class="text-center">User(s) ahead of you</div>
    </div>
  `
    : `
    <div class="bg-white p-8 rounded-lg shadow-md w-96" hx-trigger="load delay:5000ms" hx-get="/" hx-target="closest body" hx-swap="outer html">
      <div class="text-center text-xl mb-4">Error</div><div class="text-center">Sorry, please try again later.</div>
    </div>
  `;
}

const validateLogin = (username: string, password: string) => {
  return username === 'unruffled-chooser' && password === 'silliness-repaying'
}
