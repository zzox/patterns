import { challenges } from './challenges.js'
import { Game } from './Game.js'
import { createMenu, hideMenu } from './menu.js'
import State from './State.js'
import { removeChildElements, showModal, sleep, timeToDisplay } from './utils.js'

console.log('loaded')

const startButton = document.getElementById('start')
const startMenu = document.getElementById('intro')
let game

const win = (time) => {
  showModal('Win!', timeToDisplay(time))
  game = null
}

const lose = async () => {
  await sleep(500)
  showModal('Lose...')
}

const startChallenge = (index) => {
  game = new Game(challenges[index], index, win, lose)
  startMenu.style.opacity = 0
  hideMenu()
}

// TODO: turn the following into a class
const run = () => {
  document.addEventListener('keydown', (event) => {
    console.time('[patterns] - keydown timer')

    try {
      game.keyPressed(event.key)
    } catch (e) {
      console.warn(e)
    }

    console.timeEnd('[patterns] - keydown timer')
  })

  document.addEventListener('keyup', (event) => {
    try {
      game.keyReleased(event.key)
    } catch (e) {
      console.warn(e)
    }
  })

  startButton.onclick = () => {
    if (!game) {
      createMenu(startChallenge)
    }

    // HACK: allow tweening of start menu opacity
    setTimeout(() => startMenu.remove(), 125)
  }

  // TODO: add touch event listeners for each button div
}

// TODO: remove run function if we don't need anything async
run()
