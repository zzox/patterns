import { challenges } from './challenges.js'
import { Game } from './Game.js'
import { createMenu, hideMenu } from './menu.js'
import State from './State.js'
import { hideElement, removeChildElements, showElement, showModal, sleep, timeToDisplay } from './utils.js'

console.log('loaded')

const startButton = document.getElementById('start')
const startMenu = document.getElementById('intro')
let game

const gotoMainMenu = () => {
  showElement(startMenu)
  game = null
}

const win = (time) => {
  showModal('Win!', timeToDisplay(time), [
    { label: 'Next', callback: (levelIndex) => startChallenge(levelIndex + 1) },
    { label: 'Level Select', callback: () => createMenu(startChallenge) }
  ])
  game = null
}

const lose = async () => {
  await sleep(500)
  showModal('Lose...', undefined, [
    { label: 'Restart', callback: (levelIndex) => startChallenge(levelIndex) },
    { label: 'Level Select', callback: () => createMenu(startChallenge) }
  ])
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

    if (event.repeat) return

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

    hideElement(startMenu)
  }

  // TODO: add touch event listeners for each button div
}

// TODO: remove run function if we don't need anything async
run()
