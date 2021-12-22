import { challenges } from './challenges.js'
import { Game } from './Game.js'

console.log('loaded')

const startButton = document.getElementById('start')
const startMenu = document.getElementById('intro')
let game

const run = () => {
  document.addEventListener('keydown', (event) => {
    console.time('test')

    try {
      game.keyPressed(event.key)
    } catch (e) {
      console.warn(e)
    }

    console.timeEnd('test')
  })

  document.addEventListener('keyup', (event) => {
    game.keyReleased(event.key)
  })

  startButton.onclick = () => {
    if (!game) {
      game = new Game(challenges[0])
      startMenu.style.opacity = 0
    }

    // HACK: allow tweening of start menu opacity
    setTimeout(() => startMenu.remove(), 125);
  }
  // TODO: add touch event listeners for each button div
}

// TODO: remove run function if we don't need anything async
run()
