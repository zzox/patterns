import { levels } from './levels.js'
import State from './State.js'
import { makeDiv, sleep, removeChildElements, timeToDisplay } from './utils.js'

const menu = document.getElementById('menu')

export const createMenu = (callback) => {
  menu.style.opacity = 1
  menu.style.visibility = 'visible'
  levels.forEach((challenge, i) => {
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

    title.innerText = challenge.name
    limit.innerText = `${challenge.limit / 1000}s`
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
