# Toy Drone

A toy drone simulation on a 10 x 10 holographic test range, built with vanilla JavaScript for the Stormcraft Studios Toy Drone Assessment.

- **Play it:** https://getviolanonboard.co.za/
- **Mirror:** https://toy-drone.vercel.app/ (the same deployment, in case the custom domain is unreachable)
- **Source (.zip):** https://getviolanonboard.co.za/toy-drone-source.zip
- **Repository:** https://github.com/violan7naidoo/toy-drone

## About me

**Violan Naidoo**

- Email: violan7naidoo@gmail.com
- LinkedIn: https://www.linkedin.com/in/violan-naidoo/
- GitHub: https://github.com/violan7naidoo

## How to play

Tap or click a cell to choose where the drone lands, then pick the way it faces. After that:

| Action | Button | Keyboard | Typed command |
| --- | --- | --- | --- |
| Place the drone | tap a cell, then N / E / S / W | - | `PLACE X,Y,F` |
| Move one cell forward | forward arrow | Arrow Up | `MOVE` |
| Turn 90 degrees | turn arrows | Arrow Left, Arrow Right | `LEFT`, `RIGHT` |
| Fire two cells ahead | Attack | Space | `ATTACK` |
| Announce the position | Report | R | `REPORT` |

The command console accepts one command or a whole pasted script, one command per line. It is always visible on desktop; on a phone it opens with the `>_` button. It is not case sensitive and forgives extra spaces.

The buttons in the top bar switch between the 3D and top view, show the cell coordinates, mute the sound, and open the project information.

## The rules, as built

- The surface is 10 x 10. `0,0` is the south-west corner.
- Every command is discarded until a valid `PLACE`. `PLACE` can be repeated at any time.
- A move that would leave the surface is refused. The drone stays where it is, says why, and the next valid command works normally.
- `ATTACK` explodes on the cell two ahead. If there are not two cells ahead, it is refused.
- Nothing fails silently: every refusal has an animation, a sound and a message.

### A note on example (a) in the brief

The brief's first example is:

```
PLACE 0,0,NORTH
MOVE
LEFT
LEFT
ATTACK
REPORT   ->  the brief prints 0,0,SOUTH
```

By the brief's own rules the answer is `0,1,SOUTH`: `MOVE` takes the drone from `0,0` to `0,1`, the two `LEFT` turns face it south without moving it, and the `ATTACK` is ignored because only one cell lies to the south. I built to the written rules. There is a unit test for this sequence with a comment recording the decision. Examples (b) and (c) produce exactly what the brief prints: `0,0,WEST` and `3,3,NORTH`.

## Run it locally

You need Node.js 20 or newer.

```
npm install
npm run dev      # dev server, also reachable from a phone on the same Wi-Fi
npm test         # 89 unit tests
npm run build    # production build in dist/, with source maps
```

## How it is built

Vanilla ES6 modules, plain CSS and no runtime dependencies. Vite is the build tool only (dev server, minified build, source maps). Vitest runs the tests.

The code is three layers that do not know about each other:

```
input  ->  command object  ->  queue  ->  simulator  ->  result object  ->  views
```

```
src/
  config.js            board size, facings, step vectors, attack range, shot time
  commandQueue.js      runs commands one at a time and waits for the animations
  main.js              wiring only: creates the pieces and connects them
  logic/               the rules. No document, no window. Runs in a terminal.
    surface.js         isOnSurface(x, y): the one check PLACE, MOVE and ATTACK share
    simulator.js       execute(command) returns a result that says what happened
    parser.js          text to command objects; never throws
  view/                draw results; never decide anything
    boardView.js       the 100 cells
    droneView.js       glide, turn, lean, land, bump, recoil
    effectsView.js     muzzle flash, shot, burst, shock ring, scorch mark
    hudView.js         status line, ready state, a sentence for every refusal
    soundView.js       Web Audio, synthesised in code, no audio files
    motion.js          turns "an animation finished" into a promise
    coords.js          the only place board Y is flipped into screen rows
  input/               make command objects; nothing else
    touchControls.js   keyboard.js   placement.js   console.js
    preferences.js     remembered toggles: view, coordinates, sound
  styles/              tokens, base, layout, board, pieces, controls, info
```

A few decisions worth explaining:

- **The rules never touch the page.** That is why they can be proven with fast unit tests, and why the look could change completely without touching a rule.
- **A refusal is a result too.** The simulator checks first and only then replaces its state, so a blocked move needs no undo, and the views can show *why* something was refused.
- **Every input makes the same command object.** A tap, a key and a typed line are indistinguishable to the simulator.
- **One queue owns time.** Each view returns a promise that resolves when its animation ends; the queue waits for all of them, so a pasted script plays step by step and animations never overlap.
- **Positioning is CSS only.** A piece's position is `translate: column x (100% + gap)`, where 100% is the piece's own size, one cell. It stays exact at any screen size, in top view and in 3D, with no resize code.
- **Accessibility and comfort:** keyboard control, visible focus, live regions for messages, 44px touch targets, and `prefers-reduced-motion` removes movement while keeping the feedback.

## Tests

`npm test` runs 89 unit tests: every rule at the edges and corners, the discard-until-placed rule, the parser against malformed input, the command queue's ordering, and the brief's three examples run end to end as pasted text.

## Tools, and how I worked

I built this over four days. An AI assistant (Claude, in VS Code) was part of my workflow, and I want to be open about how:

- It proposed the layered architecture and coached me while I typed the board, the rules, the parser, the drone view and the input layer myself, reviewing each step.
- For the visual polish (the holo theme, the 3D view, the drone animation, sound and effects) it wrote the code under my direction, and I reviewed, tested and adjusted the result.

I can walk through any file and explain why it is written the way it is.

## Tested on

Chrome and Edge on Windows 11, and Chrome on my phone, both over the local network and on the live site.
