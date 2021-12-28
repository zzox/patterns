import { levels } from './levels.js'
import { Game } from './Game.js'
import State from './State.js'
import { createMenu, hideMenu, createChallengeMenu, hideChallengeMenu } from './menu.js'
import { hideElement, removeChildElements, showElement, showModal, sleep, timeToDisplay } from './utils.js'

const startButton = document.getElementById('start')
const challengesButton = document.getElementById('challenges')
const startMenu = document.getElementById('intro')
const modalElement = document.getElementById('popup')
const menuElement = document.getElementById('menu')
const challengesElement = document.getElementById('challenge-menu')
const createChallengeElement = document.getElementById('create-challenge')

let game, keyListener
let menuItemSelected = null

const destroyGame = () => {
  game.destroy()
  game = null
}

const gotoMainMenu = async () => {
  console.log('trying')
  try {
    destroyGame()
  } catch (e) {}
  showElement(startMenu)
  // HACK: hide all sub menus
  await Promise.all([hideElement(menuElement), hideElement(challengesElement)])
  removeChildElements(menuElement)
  removeChildElements(challengesElement)
  menuItemSelected = null
}

const removeListener = () => {
  document.removeEventListener('keydown', keyListener)
}

const keydownListener = (restartCallback, escapeCallback, nextCallback) => (event) => {
  event.preventDefault()
  switch (event.key) {
    case 'Enter':
      if (nextCallback) {
        nextCallback()
      } else {
        restartCallback()
      }
      break
    case 'n':
      if (nextCallback) {
        nextCallback()
      }
      break
    case 'r':
      restartCallback()
      break
    case 'q':
    case 'Escape':
      escapeCallback()
      break
    default: break
  }
}

const win = async (time, levelIndex) => {
  await sleep(500)

  const nextCallback = () => {
    startLevel(levelIndex + 1)
    hideElement(modalElement)
    removeListener()
  }

  const restartCallback = () => {
    startLevel(levelIndex)
    hideElement(modalElement)
    removeListener()
  }

  const escapeCallback = () => {
    createMenu(startLevel, gotoMainMenu)
    menuItemSelected = 0
    hideElement(modalElement)
    removeListener()
  }

  keyListener = keydownListener(restartCallback, escapeCallback, nextCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Win!', timeToDisplay(time), [
    { label: '[N]ext', callback: nextCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])

  destroyGame()
}

const lose = async (levelIndex) => {
  await sleep(500)

  const restartCallback = () => {
    startLevel(levelIndex)
    hideElement(modalElement)
    removeListener()
  }

  const escapeCallback = () => {
    createMenu(startLevel, gotoMainMenu)
    menuItemSelected = 0
    hideElement(modalElement)
    removeListener()
  }

  keyListener = keydownListener(restartCallback, escapeCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Lose...', undefined, [
    { label: '[R]estart', callback: restartCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])

  destroyGame()
}

const startLevel = (index) => {
  // HACK: should not be needed
  if (!game) {
    game = new Game(levels[index], index, win, lose)
    startMenu.style.opacity = 0
    hideMenu()
    menuItemSelected = null
  } else {
    console.warn(
      'Trying to start a game with an existing instance.\n' +
      'Not all listeners are cleaned up.'
    )
  }
}

const startChallenge = (index) => {
  if (!game) {
    game = new Game(State.instance.challenges[index], index, ()=>console.log('challenge won'), ()=>console.log('challenge lost'))
    startMenu.style.opacity = 0
    hideMenu()
    menuItemSelected = null
  } else {
    console.warn(
      'Trying to start a game with an existing instance.\n' +
      'Not all listeners are cleaned up.'
    )
  }
}

const createChallenge = () => {
  hideChallengeMenu()
  showElement(createChallengeElement)
}

const run = () => {
  document.addEventListener('keydown', (event) => {
    event.preventDefault()

    const key = event.key
    if (menuItemSelected !== null && ['ArrowUp', 'ArrowDown', 'Enter'].includes(key)) {
      const menuType = menuElement.style.visibility === 'visible' ? 'main' : 'challenge'
      const numLevels = menuType === 'main'
        ? State.instance.completedLevels.length
        : State.instance.challenges.length + 1
      const menuItems = menuType === 'main'
        ? Array.from(menuElement.children)
        : Array.from(challengesElement.children)
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
    event.preventDefault()
    try {
      game.keyReleased(event.key)
    } catch (e) {}
  })

  Array.from(document.querySelectorAll('.tap-button')).forEach((button, i) => {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      try {
        game.touchPressed(i + 1)
      } catch (e) {}
    })

    button.addEventListener('pointerup', (event) => {
      event.preventDefault()
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

  challengesButton.onclick = () => {
    if (!game) {
      createChallengeMenu(startChallenge, createChallenge, gotoMainMenu)
      menuItemSelected = 0
    }

    hideElement(startMenu)
  }
}

// TODO: remove run function if we don't need anything async
run()
