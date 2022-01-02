import { levels } from './levels.js'
import { Game } from './Game.js'
import State from './State.js'
import { createMenu, hideMenu, createChallengeMenu, hideChallengeMenu } from './menu.js'
import { gebi, hideElement, removeChildElements, showElement, showModal, sleep, timeToDisplay } from './utils.js'

const startButton = gebi('start')
const challengesButton = gebi('challenges')
const startMenu = gebi('intro')
const modalElement = gebi('popup')
const aboutElement = gebi('about')
const menuElement = gebi('menu')
const mainElement = gebi('main')
const challengesElement = gebi('challenge-menu')
const createChallengeElement = gebi('create-challenge')
const challengeBackButton = gebi('create-challenge-back')
const challengeForm = gebi('challenge-form')
const errorTextElement = gebi('challenge-error')
const aboutButton = gebi('about-game')
const aboutBackButton = gebi('about-back')

let game, keyListener
let menuItemSelected = null

const destroyGame = () => {
  hideElement(mainElement)
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
  const isLastLevel = levelIndex === levels.length - 1

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

  await sleep(500)

  keyListener = keydownListener(restartCallback, escapeCallback, isLastLevel ? gotoMainMenu : nextCallback)
  document.addEventListener('keydown', keyListener)

  const displayTime = `${newBest ? 'New Best: ' : ''}${timeToDisplay(time)}`

  showModal('Win!', displayTime, isLastLevel ? 'All Levels Complete!' : '', [
    { label: isLastLevel ? 'Quit' : '[N]ext', callback: nextCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])

  destroyGame()
}

const lose = async (levelIndex) => {
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

  await sleep(500)

  keyListener = keydownListener(restartCallback, escapeCallback)
  document.addEventListener('keydown', keyListener)

  showModal('Lose...', undefined, undefined, [
    { label: '[R]estart', callback: restartCallback },
    { label: 'Level Select', callback: escapeCallback }
  ])

  destroyGame()
}

const winChallenge = async (time, levelIndex, newBest = false, isNewlyCompleted = false) => {
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

  await sleep(500)

  keyListener = keydownListener(isNewlyCompleted ? () => {} : restartCallback, escapeCallback)
  document.addEventListener('keydown', keyListener)

  const displayTime = `${newBest ? 'New Best: ' : ''}${timeToDisplay(time)}`

  showModal(isNewlyCompleted ? 'Challenge created!' : 'Win!', displayTime, undefined, [
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

  showModal('Lose...', undefined, undefined, [
    { label: '[R]estart', callback: restartCallback },
    { label: 'Challenge Select', callback: escapeCallback }
  ])

  destroyGame()
}

const startLevel = (index) => {
  // HACK: should not be needed
  if (!game) {
    showElement(mainElement)
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
    showElement(mainElement)
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

// HACK: disable double tap to zoom on touch events for tap-buttons only
const touchEventHandlers = (event) => {
  if (event.target.className.split(' ')[0] === 'tap-button') {
    event.preventDefault()
  }
}

const checkChallengeUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const name = params.get('name')
  let pattern = params.get('pattern')
  let limit = params.get('limit')
  let repetitions = params.get('repetitions')

  if (name && pattern && limit && repetitions) {
    pattern = createPattern(pattern)
    limit = parseInt(limit)
    repetitions = parseInt(repetitions)

    const existingIndex = State.instance.challenges.findIndex((challenge) =>
      name === challenge.name &&
      pattern === challenge.pattern &&
      limit === challenge.limit &&
      repetitions === challenge.repetitions
    )

    if (existingIndex === -1) {
      State.instance.addChallenge({ name, pattern, limit, repetitions })
      startChallenge(State.instance.challenges.length - 1)
    } else {
      startChallenge(existingIndex)
    }
  }
}

const run = () => {
  document.addEventListener('keydown', (event) => {
    const key = event.key

    if (menuItemSelected !== null && ['Escape', 'ArrowUp', 'ArrowDown', 'Enter'].includes(key)) {
      const menuType = menuElement.style.visibility === 'visible' ? 'main' : 'challenge'
      const numLevels = menuType === 'main'
        ? State.instance.completedLevels.length
        : State.instance.challenges.length + 1
      const menuItems = menuType === 'main'
        ? Array.from(menuElement.children)
        : Array.from(challengesElement.children)
      menuItems.forEach(item => { item.classList.remove('menu-item-focused') })

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

      if (key === 'Escape') {
        menuItems[0].click()
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

  document.addEventListener('touchstart', (event) => touchEventHandlers(event))
  document.addEventListener('touchend', (event) => touchEventHandlers(event))
  document.addEventListener('touchcancel', (event) => touchEventHandlers(event, false))
  document.addEventListener('touchmove', (event) => touchEventHandlers(event, false))

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
    }
  }

  challengeBackButton.onclick = () => {
    hideElement(createChallengeElement)
    menuItemSelected = 0
    createChallengeMenu(startChallenge, createChallenge, gotoMainMenu)
  }

  aboutButton.onclick = () => {
    showElement(aboutElement)
    hideElement(startMenu)
  }

  aboutBackButton.onclick = () => {
    hideElement(aboutElement)
    gotoMainMenu()
  }
}

run()
checkChallengeUrl()
