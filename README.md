# Tic Tac Toe
Assignment from [The Odin Project](https://www.theodinproject.com/lessons/node-path-javascript-tic-tac-toe)

## Task
Instructions:
1. Store gameboard as array inside Gameboard object
2. Store players as objects
3. Have an object that controls the flow of the game

Try to have as little global code as possible.

If you only need one of something, use Revealing Module.

If you need multiples of something, use factory functions.

4. Set up HTML and write a JS function to render the gameboard to the webpage.
5. Write function that allows players to add marks to a specific spot on click. Tie this to the DOM. Don't forget to stop them from overwriting spots that are filled!
6. Build logic that checks for when game is over: 3 in a row, or tie.
7. UI: allow players to enter names, include start/restart button, congratulate winner.
8. Optional: create AI so player can play against PC.

## Notes to self
- `<template></template>` HTML element: clone the contents, not the template itself, or you'll get a `DocumentFragment` and won't be able to bind events to it. I did this with `const template = document.querySelector('template').content.firstElementChild;`, and used it with `let tile = template.cloneNode(true);`
- Ran into initialization issues because I accidentally created circular dependency in UIManager. I think I need to avoid making direct references to GameManager in other objects, and do all externally-reliant initialization in GameManager.
- I couldn't get win state checking to work until I changed the returned object `createTile`'s `symbol` to `getSymbol` (returning a function instead of the property).