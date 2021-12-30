import { levels } from './levels.js'
import { Game } from './Game.js'
import State from './State.js'
import { createMenu, hideMenu, createChallengeMenu, hideChallengeMenu } from './menu.js'
import { gebi, hideElement, removeChildElements, showElement, showModal, sleep, timeToDisplay } from './utils.js'

const startButton = gebi('start')
const challengesButton = gebi('challenges')
const startMenu = gebi('intro')
const modalElement = gebi('popup')
const menuElement = gebi('menu')
const challengesElement = gebi('challenge-menu')
const createChallengeElement = gebi('create-challenge')
const challengeForm = gebi('challenge-form')
const errorTextElement = gebi('challenge-error')

let game, keyListener
let menuItemSelected = null

const destroyGame = () => {
  game.destroy()
  game = null
}

const gotoMainMenu = async () => {
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

const win = async (time, levelIndex, newBest = false) => {
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

  const displayTime = `${newBest ? 'New Best: ' : ''}${timeToDisplay(time)}`

  showModal('Win!', displayTime, [
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

const winChallenge = async (time, levelIndex, newBest = false) => {
  const isNewlyCompleted = levelIndex === -1
  await sleep(500)

  const restartCallback = () => {
    startChallenge(levelIndex)
    hideElement(modalElement)
    removeListener()
  }

  const escapeCallback = () => {
    createChallengeMenu(startChallenge, createChallenge, gotoMainMenu)
    menuItemSelected = 0
    hideElement(modalElement)
    removeListener()
  }

  keyListener = keydownListener(isNewlyCompleted ? () => {} : restartCallback, escapeCallback)
  document.addEventListener('keydown', keyListener)

  const displayTime = `${newBest ? 'New Best: ' : ''}${timeToDisplay(time)}`

  showModal(isNewlyCompleted ? 'Challenge created!' : 'Win!', displayTime, [
    { label: 'Challenge Select', callback: escapeCallback }
  ])

  destroyGame()
}

const loseChallenge = async (levelIndex, challengeData) => {

  await sleep(500)

  const restartCallback = () => {
    startChallenge(levelIndex, challengeData)
    hideElement(modalElement)
    removeListener()
  }

  const escapeCallback = () => {
    createChallengeMenu(startChallenge, createChallenge, gotoMainMenu)
    menuItemSelected = 0
    hideElement(modalElement)
    removeListener()
  }

  keyListener = keydownListener(restartCallback, escapeCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Lose...', undefined, [
    { label: '[R]estart', callback: restartCallback },
    { label: 'Challenge Select', callback: escapeCallback }
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

const startChallenge = (index, challengeData) => {
  if (!game) {
    game = new Game(
      index === -1 ? challengeData : State.instance.challenges[index],
      index,
      winChallenge,
      loseChallenge,
      true
    )
    startMenu.style.opacity = 0
    hideChallengeMenu()
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

const createPattern = (pattern) =>
  pattern.split('')
    .map((item) => {
      const value = parseInt(item)
      if (typeof value !== 'number' || isNaN(value) || value < 1 || value > 4) {
        throw new Error('Non 1-4 number in pattern')
      }
      return value
    })

const run = () => {
  document.addEventListener('keydown', (event) => {
    const key = event.key

    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(key)) {
      if (menuItemSelected !== null) {
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

  challengeForm.onsubmit = (event) => {
    event.preventDefault()
    try {
      const name = gebi('challenge-name').value
      const pattern = createPattern(gebi('challenge-pattern').value)
      const repetitions = parseInt(gebi('challenge-repetitions').value)
      const limit = parseInt(gebi('challenge-limit').value)
      const errorTextElement = gebi('challenge-error')
      if (!name || !pattern || !repetitions || isNaN(repetitions) || !limit || isNaN(limit)) {
        throw new Error('Bad Input.')
      }

      startChallenge(-1, { name, pattern, repetitions, limit })
      hideElement(createChallengeElement)
      errorTextElement.innerText = ''
      gebi('challenge-name').value = ''
      gebi('challenge-pattern').value = ''
      gebi('challenge-repetitions').value = ''
      gebi('challenge-limit').value = ''
    } catch (e) {
      errorTextElement.innerText = 'Error, please try again.'
      return
    }
  }
}

// TODO: remove run function if we don't need anything async
run()
