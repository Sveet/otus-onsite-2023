import { Elysia } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams } from "../types";

const RESUME_TIME = new Date(process.env.RESUME_TIME ?? Date.now())
export const waiting = ({ dataKey, name, url }: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .get(url, ({ user, html }) => {
    if(!user.data.has(dataKey)){
      user.data.set(dataKey, { start: new Date(), minimum: (1 * 60 * 1000), views: 1 })
      user.save();
    } else {
      const data = user.data.get(dataKey)!
      data.views += 1;
      user.data.set(dataKey, data);
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
          <p class="text-lg mb-4 text-blue-600">Thanks for playing, you are ahead of the curve! Stay tuned for the rest of the challenge.</p>
          ${generateCountdownHTML(RESUME_TIME)}
        </div>
      </body>
      </html>
    `)
  })
  .post('/waiting_countdown', ({ user, html }) => {
    const data = user.data.get(dataKey)!
    data.views += 1;
    user.data.set(dataKey, data);
    user.save();

    return html(generateCountdownHTML(RESUME_TIME))
  })

type RemainingTime = {
  days: number,
  hours: number,
  minutes: number,
  seconds: number
};

function getTimeRemaining(endTime: Date): RemainingTime {
  const now = new Date().getTime();
  const t = endTime.getTime() - now;
  return {
    days: Math.floor(t / (1000 * 60 * 60 * 24)),
    hours: Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((t % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((t % (1000 * 60)) / 1000)
  };
}

function getDisplayTime(remainingTime: RemainingTime): string {
  if (remainingTime.days > 0) {
    if (remainingTime.hours >= 12) {
      return `~${remainingTime.days + 1} days`;
    }
    return `~${remainingTime.days} days`;
  } else if (remainingTime.hours > 0) {
    if (remainingTime.minutes >= 30) {
      return `~${remainingTime.hours + 1} hours`;
    }
    return `~${remainingTime.hours} hours`;
  } else if (remainingTime.minutes > 0) {
    if (remainingTime.seconds >= 30) {
      return `~${remainingTime.minutes + 1} minutes`;
    }
    return `~${remainingTime.minutes} minutes`;
  } else if (remainingTime.seconds > 0) {
    return `${remainingTime.seconds} seconds`;
  } else {
    return "Very Soon!";
  }
}

const generateCountdownHTML = (endTime: Date): string => {
  const remainingTime = getTimeRemaining(endTime);
  const displayTime = getDisplayTime(remainingTime);

  let delay = (remainingTime.minutes > 0 || remainingTime.hours > 0) ? "10000ms" : "1000ms";
  if (displayTime === "Very Soon!") {
    delay = "";  // No delay if time is up
  }

  return `
    <div hx-post="/waiting_countdown" hx-swap="outerHTML" hx-trigger="load delay:${delay}" class="mt-4 p-4 border-t border-blue-200 font-semibold text-xl text-blue-700">
      Resumes in: ${displayTime}
    </div>
  `;
}