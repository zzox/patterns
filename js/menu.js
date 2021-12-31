import { levels } from './levels.js'
import State from './State.js'
import { makeDiv, sleep, removeChildElements, timeToDisplay, gebi } from './utils.js'

const menu = gebi('menu')
const challengeMenu = gebi('challenge-menu')

export const createMenu = (callback, returnCallback) => {
  // reset preferred keys
  State.instance.preferredKeys = []

  const backButton = makeDiv('back-button')
  backButton.onclick = returnCallback
  // for now, focused item is at 0
  backButton.classList.add('menu-item-focused')
  const backText = document.createElement('h1')
  backText.innerText = 'Back'
  backButton.appendChild(backText)
  menu.appendChild(backButton)

  menu.style.opacity = 1
  menu.style.visibility = 'visible'
  levels.forEach((level, i) => {
    const complete = i <= State.instance.completedLevels.length - 1
    const playable = i <= State.instance.completedLevels.length

    const div = makeDiv('menu-item')
    if (!playable) {
      div.classList.add('non-playable')
    }

    const leftDiv = makeDiv('menu-item-left')
    const rightDiv = makeDiv('menu-item-right')

    const title = document.createElement('h2')
    const limit = document.createElement('h3')
    const best = document.createElement('h3')
    const completed = document.createElement('h4')

    title.innerText = level.name
    limit.innerText = `${level.limit / 1000}s`
    best.innerHTML = complete
      ? `Best: ${timeToDisplay(State.instance.completedLevels[i].time)}`
      : '&nbsp'
    completed.innerText = complete ? 'COMPLETED' : ''

    div.appendChild(leftDiv)
    div.appendChild(rightDiv)

    leftDiv.appendChild(title)
    leftDiv.appendChild(best)
    rightDiv.appendChild(limit)
    rightDiv.appendChild(completed)

    menu.appendChild(div)

    div.onclick = () => playable ? callback(i) : () => {}
  })
}

export const hideMenu = async () => {
  menu.style.opacity = 0
  await sleep(125)
  menu.style.visibility = 'hidden'
  removeChildElements(menu)
}

export const createChallengeMenu = (callback, createChallengeCallback, returnCallback) => {
  // reset preferred keys
  State.instance.preferredKeys = []

  const backButton = makeDiv('back-button')
  backButton.onclick = returnCallback
  backButton.classList.add('menu-item-focused')
  const backText = document.createElement('h1')
  backText.innerText = 'Back'
  backButton.appendChild(backText)
  challengeMenu.appendChild(backButton)

  const createChallengeButton = makeDiv('create-challenge')
  createChallengeButton.onclick = createChallengeCallback
  const ccText = document.createElement('h2')
  ccText.innerText = 'Create Challenge'
  createChallengeButton.appendChild(ccText)
  challengeMenu.appendChild(createChallengeButton)

  challengeMenu.style.opacity = 1
  challengeMenu.style.visibility = 'visible'
  State.instance.challenges.forEach((challenge, i) => {
    const div = makeDiv('menu-item')
    const leftDiv = makeDiv('menu-item-left')
    const rightDiv = makeDiv('menu-item-right')

    const title = document.createElement('h2')
    const limit = document.createElement('h3')
    const best = document.createElement('h3')
    const completed = document.createElement('h4')

    title.innerText = challenge.name
    limit.innerText = `${challenge.limit / 1000}s`
    best.innerHTML = challenge.completed
      ? `Best: ${timeToDisplay(challenge.time)}`
      : '&nbsp'
    completed.innerText = challenge.completed ? 'COMPLETED' : ''

    div.appendChild(leftDiv)
    div.appendChild(rightDiv)

    leftDiv.appendChild(title)
    leftDiv.appendChild(best)
    rightDiv.appendChild(limit)
    rightDiv.appendChild(completed)

    challengeMenu.appendChild(div)

    div.onclick = () => callback(i)
  })
}

export const hideChallengeMenu = async () => {
  challengeMenu.style.opacity = 0
  await sleep(125)
  challengeMenu.style.visibility = 'hidden'
  removeChildElements(challengeMenu)
}
