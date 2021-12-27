import { levels } from './levels.js'
import { Game } from './Game.js'
import State from './State.js'
import { createMenu, hideMenu } from './menu.js'
import { hideElement, removeChildElements, showElement, showModal, sleep, timeToDisplay } from './utils.js'

const startButton = document.getElementById('start')
const startMenu = document.getElementById('intro')
const modalElement = document.getElementById('popup')
const menuElement = document.getElementById('menu')

let game, keyListener
let menuItemSelected = null

const gotoMainMenu = async () => {
  try {
    game.destroy()
    game = null
  } catch (e) {}
  showElement(startMenu)
  await hideElement(menuElement)
  removeChildElements(menuElement)
}

const removeListener = () => {
  document.removeEventListener('keydown', keyListener)
}

const keydownListener = (restartCallback, escapeCallback, nextCallback) => (event) => {
  switch (event.key) {
    case 'Enter':
      if (nextCallback) {
        nextCallback()
      } else {
        restartCallback()
      }
      removeListener()
      break
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
    createMenu(startLevel, gotoMainMenu)
    menuItemSelected = 0
    hideElement(modalElement)
  }

  keyListener = keydownListener(restartCallback, escapeCallback, nextCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Win!', timeToDisplay(time), [
    { label: '[N]ext', callback: nextCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])

  game.destroy()
  game = null
}

const lose = async (levelIndex) => {
  await sleep(500)

  const restartCallback = () => {
    startLevel(levelIndex)
    hideElement(modalElement)
  }

  const escapeCallback = () => {
    createMenu(startLevel, gotoMainMenu)
    menuItemSelected = 0
    hideElement(modalElement)
  }

  keyListener = keydownListener(restartCallback, escapeCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Lose...', undefined, [
    { label: '[R]estart', callback: restartCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])

  game.destroy()
  game = null
}

const startLevel = (index) => {
  game = new Game(levels[index], index, win, lose)
  startMenu.style.opacity = 0
  hideMenu()
  menuItemSelected = null
}

const run = () => {
  document.addEventListener('keydown', (event) => {
    const key = event.key
    if (menuItemSelected !== null && ['ArrowUp', 'ArrowDown', 'Enter'].includes(key)) {
      const numLevels = State.instance.completedLevels.length
      const menuItems = Array.from(menuElement.children)
      menuItems.forEach(item => { item.classList.remove('menu-item-focused')})

      if (key === 'ArrowUp') {
        menuItemSelected--
        if (menuItemSelected < 0) {
          // includes back button
          menuItemSelected = numLevels + 1
        }
      }

      if (key === 'ArrowDown') {
        menuItemSelected++
        if (menuItemSelected > numLevels + 1) {
          menuItemSelected = 0
        }
      }

      menuItems[menuItemSelected].classList.add('menu-item-focused')
      menuItems[menuItemSelected].scrollIntoView()

      if (key === 'Enter') {
        menuItems[menuItemSelected].click()
      }
    }

    if (event.repeat) return

    try {
      game.keyPressed(key)
    } catch (e) {}
  })

  document.addEventListener('keyup', (event) => {
    try {
      game.keyReleased(event.key)
    } catch (e) {}
  })

  Array.from(document.querySelectorAll('.tap-button')).forEach((button, i) => {
    button.addEventListener('mousedown', () => {
      try {
        game.touchPressed(i + 1)
      } catch (e) {}
    })

    button.addEventListener('mouseup', () => {
      try {
        game.touchReleased(i + 1)
      } catch (e) {}
    })
  })

  startButton.onclick = () => {
    if (!game) {
      createMenu(startLevel, gotoMainMenu)
      menuItemSelected = 0
    }

    hideElement(startMenu)
  }
}

// TODO: remove run function if we don't need anything async
run()
