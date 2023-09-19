export const getLoginPage = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Page</title>
  <script src="https://unpkg.com/htmx.org@1.9.5"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Minimal CSS for the flash effect */
    .flash {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: white;
      z-index: 9999;
      opacity: 0.8;
      display: none;
    }
  </style>
</head>
<body class="bg-gray-200 h-screen flex justify-center items-center">

<div class="flash" id="flashEffect"></div>

<div class="bg-white p-8 rounded-lg shadow-md w-96">
  <div class="flex justify-center mb-6">
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
    <button hx-post="/login" hx-swap="none" class="bg-blue-500 text-white w-full p-2 rounded-md hover:bg-blue-600">Login</button>
  </div>
  <div class="text-center">
    <button hx-post="/signup" hx-target="closest body" class="text-blue-500 hover:underline">Signup</button>
  </div>
</div>

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
    document.getElementById('username').value = ''
    document.getElementById('password').value = ''
  }
  document.body.addEventListener('failedLogin', (e)=>{
    playThunder();
    clearForm();
  })
</script>
</body>
</html>
`

export const getSignup = (remaining: number = 13, dropRate_ms: number = 6000, jitter_ms: number = 4500) => {
  const jitterDirection = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
  const delay = dropRate_ms + (jitter_ms * Math.random() * jitterDirection);

  console.log(`remaining ${typeof remaining} ${remaining}`)
  return remaining > 0 ? `
    <div class="bg-white p-8 rounded-lg shadow-md w-96" hx-trigger="load delay:${delay}ms" hx-swap="outerHTML" hx-post="/signup" hx-vals="js:{remaining: ${remaining - 1}}">
      <div class="text-center text-xl mb-4">Waiting in line...</div>
      <div id="counter" class="text-center text-3xl mb-4">${remaining}</div>
      <div class="text-center">User(s) ahead of you</div>
    </div>
  `
    : `
    <div class="bg-white p-8 rounded-lg shadow-md w-96" hx-trigger="load delay:7500ms" hx-get="/" hx-target="closest body" hx-swap="outer html">
      <div class="text-center text-xl mb-4">Error</div><div class="text-center">Sorry, please try again later.</div>
    </div>
  `;
}