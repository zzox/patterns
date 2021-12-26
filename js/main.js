import { levels } from './levels.js'
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

const win = (time, levelIndex) => {
  showModal('Win!', timeToDisplay(time), [
    { label: 'Next', callback: () => startLevel(levelIndex + 1) },
    { label: 'Level Select', callback: () => createMenu(startLevel) }
  ])
  game = null
}

const lose = async (levelIndex) => {
  await sleep(500)
  showModal('Lose...', undefined, [
    { label: 'Restart', callback: () => startLevel(levelIndex) },
    { label: 'Level Select', callback: () => createMenu(startLevel) }
  ])
}

const startLevel = (index) => {
  game = new Game(levels[index], index, win, lose)
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
      createMenu(startLevel)
    }

    hideElement(startMenu)
  }

  // TODO: add touch event listeners for each button div
}

// TODO: remove run function if we don't need anything async
run()
