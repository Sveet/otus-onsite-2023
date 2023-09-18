import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static"
import { html } from "@elysiajs/html"

const app = new Elysia()
.use(staticPlugin())
.use(html())
.get("/", ({ html }) => html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Page</title>
  <script src="https://unpkg.com/htmx.org@1.9.5"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-200 h-screen flex justify-center items-center">

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
    <button class="bg-blue-500 text-white w-full p-2 rounded-md hover:bg-blue-600">Login</button>
  </div>
  <div class="text-center">
    <button class="text-blue-500 hover:underline">Signup</button>
  </div>
</div>

</body>
</html>`))
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
