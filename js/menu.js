import { challenges } from './challenges.js'
import State from './State.js'
import { sleep } from './utils.js'

const menu = document.getElementById('menu')

export const createMenu = (callback) => {
  menu.style.opacity = 1
  menu.style.visibility = 'visible'
  challenges.forEach((challenge, i) => {
    const complete = i <= State.instance.completedChallenges.length - 1
    const playable = i <= State.instance.completedChallenges.length

    const div = document.createElement('div')
    div.classList.add('menu-item')
    if (!playable) {
      div.classList.add('non-playable')
    }

    const title = document.createElement('h2')
    const limit = document.createElement('h3')
    const best = document.createElement('h4')
    const completed = document.createElement('h4')

    title.innerText = challenge.name
    limit.innerHTML = `${challenge.limit / 1000}s`
    best.innerHTML = complete ? State.instance.completedChallenges[i].time : '&nbsp'
    completed.innerText = complete ? 'COMPLETED' : ''

    div.appendChild(title)
    div.appendChild(limit)
    div.appendChild(best)
    div.appendChild(completed)

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
