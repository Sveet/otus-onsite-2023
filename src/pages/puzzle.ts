import { Elysia, t } from "elysia"
import { html } from "@elysiajs/html";
import { UserPlugin } from "../plugin";
import { ChallengeParams, StageData } from "../types";
import { randomUUID } from "crypto";
import { upsertUser } from "../db";

const puzzle = ({ dataKey, name, stage, url }: ChallengeParams) => (app: Elysia) => app
  .use(UserPlugin())
  .use(html())
  .get(url, ({ user, html }) => {
    if(!user.data.has(dataKey)) {
      user.data.set(dataKey, { start: new Date(), minimum: (1 * 60 * 1000) })
      user.save();
    }
    return html(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <script src="/public/htmx@1.9.5.min.js"></script>
    <script src="/public/tailwind@3.3.3.min.js"></script>
    <link rel="icon" href="favicon.ico" type="image/x-icon">
  </head>
<body class="bg-gray-200 flex flex-col justify-center items-center h-screen">
  <h1 class="text-4xl font-bold mb-8">Unscramble the Puzzle</h1>
  <div class="bg-white p-4 rounded-md w-3/4 h-3/4">
    ${getPuzzle(url, randomUUID())}
  </div>
  <script>
    let firstTile = null;
    let secondTile = null;

    function handleTileClick(index) {
      if (firstTile === null) {
        firstTile = index;
        document.querySelectorAll('button')[index].classList.add('border-blue-500');
        document.querySelectorAll('button')[index].classList.add('border-4');
        document.querySelectorAll('button')[index].classList.remove('border-2');
      } else if (firstTile === index) {
        firstTile = null;
        document.querySelectorAll('button')[index].classList.add('border-2');
        document.querySelectorAll('button')[index].classList.remove('border-blue-500');
        document.querySelectorAll('button')[index].classList.remove('border-4');
      } else if (isNeighbor(firstTile, index)) {
        secondTile = index;
        htmx.trigger('#puzzle', 'puzzle', {tiles: getUpdatedTiles()});
        firstTile = null;
        secondTile = null;
      }
    }

    function isNeighbor(a, b) {
      // Calculate row and column for tile a
      const rowA = Math.floor(a / 4);
      const colA = a % 4;
    
      // Calculate row and column for tile b
      const rowB = Math.floor(b / 4);
      const colB = b % 4;
    
      // Check if they are adjacent horizontally
      const isAdjacentHorizontally = (rowA === rowB) && (Math.abs(colA - colB) === 1);
    
      // Check if they are adjacent vertically
      const isAdjacentVertically = (colA === colB) && (Math.abs(rowA - rowB) === 1);
    
      return isAdjacentHorizontally || isAdjacentVertically;
    }

    function getUpdatedTiles() {
      const tileButtons = Array.from(document.querySelectorAll('button'));
      const tiles = tileButtons.map(t => t.innerHTML.replace('\\n', '').trim());
      const a = tiles[firstTile];
      const b = tiles[secondTile];
      tiles[firstTile] = b;
      tiles[secondTile] = a;
      return tiles.map(t => t || 0);
    }
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
  .post(url, ({user, set, html, body: { id, tiles } }) => {
    if(tiles.every((t, i) => t == SOLUTION[i])){
      set.headers['HX-Trigger'] = 'success';
      user.advance(stage, dataKey);
    }

    return html(getPuzzle(url, id, tiles))
  }, {
    beforeHandle: ({ user, set, body: { id, tiles } }) => {
      if (tiles?.length != 16 || Array.from({ length: 16 }, (_, i) => i).every(a => tiles.includes(a))) {
        set.status = 400
        return 'invalid tiles'
      }
      const data = user.data.get(dataKey)!
      const attempts: { id: string, tiles: number[], swaps: number }[] = data.attempts ?? [];
      let attempt = attempts.find(a => a.id == id)
      if (!attempt) {
        attempts.push({ id, tiles, swaps: 1 })
      } else {
        attempt.tiles = tiles
        attempt.swaps += 1
      }
      data.attempts = attempts;
      user.data.set('puzzle', data);
    },
    body: t.Object({
      id: t.String(),
      tiles: t.Array(t.Numeric())
    })
  })

const SOLUTION = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
const getPuzzle = (url: string, id: string, tiles = generateUnsolvableConfiguration()) => `
<form
  id="puzzle"
  hx-post="${url}"
  hx-trigger="puzzle"
  hx-vals='js:{"id": "${id}", "tiles": getUpdatedTiles()}'
  hx-swap="outerHTML"
  class="flex flex-wrap h-full"
>

  ${tiles.map((tile, index) => `
    <button
      class="w-1/4 h-1/4 text-xl font-bold items-center justify-center border-2 rounded-md ${tile == 0 ? 'bg-transparent' : 'bg-blue-300'}"
      onclick="handleTileClick(${index})"
      type="button"
    >
      ${tile != 0 ? tile : ''}
    </button>
  `).join('')}

</form>
`

const getInversionCount = (arr: number[]) =>{
  let invCount = 0;
  for (let i = 0; i < 15; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (arr[j] && arr[i] && arr[i] > arr[j]) {
        invCount++;
      }
    }
  }
  return invCount;
}

const generateUnsolvableConfiguration = () => {
  let tiles = Array.from({ length: 16 }, (_, i) => i);
  tiles.sort(() => Math.random() - 0.5);  // Shuffle tiles

  if (getInversionCount(tiles) % 2 === 0) {
    // If inversion count is even, swap two non-blank tiles to make it odd
    let i = tiles.indexOf(1);
    let j = tiles.indexOf(2);
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  return tiles;
}


export default puzzle;