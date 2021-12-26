import { levels } from './levels.js'
import { Game } from './Game.js'
import { createMenu, hideMenu } from './menu.js'
import State from './State.js'
import { hideElement, removeChildElements, showElement, showModal, sleep, timeToDisplay } from './utils.js'

const startButton = document.getElementById('start')
const startMenu = document.getElementById('intro')
const modalElement = document.getElementById('popup')

let game, keyListener

const gotoMainMenu = () => {
  showElement(startMenu)
  game = null
}

const removeListener = () => {
  document.removeEventListener('keydown', keyListener)
}

const keydownListener = (restartCallback, escapeCallback, nextCallback) => (event) => {
  switch (event.key) {
    case 'n':
      if (nextCallback) {
        nextCallback()
        removeListener()
      }
      break
    case 'r':
      restartCallback()
      removeListener()
      break
    case 'q':
    case 'Escape':
      escapeCallback()
      removeListener()
      break
    default: break
  }
}

const win = async (time, levelIndex) => {
  await sleep(500)

  const nextCallback = () => {
    startLevel(levelIndex + 1)
    hideElement(modalElement)
  }

  const restartCallback = () => {
    startLevel(levelIndex)
    hideElement(modalElement)
  }

  const escapeCallback = () => {
    createMenu(startLevel)
    hideElement(modalElement)
  }

  keyListener = keydownListener(restartCallback, escapeCallback, nextCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Win!', timeToDisplay(time), [
    { label: '[N]ext', callback: nextCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])
  game = null
}

const lose = async (levelIndex) => {
  await sleep(500)

  const restartCallback = () => {
    startLevel(levelIndex)
    hideElement(modalElement)
  }

  const escapeCallback = () => {
    createMenu(startLevel)
    hideElement(modalElement)
  }

  keyListener = keydownListener(restartCallback, escapeCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Lose...', undefined, [
    { label: '[R]estart', callback: restartCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])
}

const startLevel = (index) => {
  game = new Game(levels[index], index, win, lose)
  startMenu.style.opacity = 0
  hideMenu()
}

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
