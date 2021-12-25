import State from './State.js'
import { makeDiv, removeChildElements, timeToDisplay } from './utils.js'

const OPTIONS = 4
const scrollBox = document.getElementById('scroll-box')

const createElements = (items) => {
  scrollBox.appendChild(makeDiv('clear-scroll'))

  for (let i = items.length - 1; i >= 0; i--) {
    const itemRow = makeDiv('item-row')

    for (let j = 1; j <= OPTIONS; j++) {
      const item = makeDiv(j === items[i] ? 'item highlight' : 'item')
      itemRow.appendChild(item)
    }

    scrollBox.appendChild(itemRow)
  }
}

const createTimer = () => {
  const timer = document.createElement('h2')
  timer.id = 'timer'
  scrollBox.appendChild(timer)
  return timer
}

// TEMP: build in the class later
const keyMap = { 'a': 1, 's': 2, 'd': 3, 'f': 4 }

export class Game {
  constructor ({ pattern, repetitions, limit }, levelIndex, win, lose) {
    let items = []
    for (let i = 0; i < repetitions; i++) {
      items = [...items, ...pattern]
    }

    removeChildElements(document.getElementById('scroll-box'))
    createElements(items)
    this.timerElement = createTimer()

    this.tapButtons = Array.from(document.querySelectorAll('.tap-button'))
    this.hitElements = Array.from(document.querySelectorAll('.item-row'))
    this.scrollBox = document.getElementById('scroll-box')

    this.scrollPos = this.scrollBox.scrollTop = this.scrollBox.scrollHeight

    this.items = items
    this.limit = limit
    this.levelIndex = levelIndex
    this.startTime = null
    this.endTime = null
    this.gameOver = false
    this.results = []

    this.winCallback = win
    this.loseCallback = lose

    this.update(0)
  }

  update (time) {
    const currentTime = Date.now() - this.startTime

    if (!this.gameOver && this.startTime && currentTime > this.limit) {
      this.lose(currentTime)
    }

    const scrollDist = this.scrollBox.scrollTop - this.scrollPos
    if (scrollDist < 2) {
      this.scrollBox.scrollTop = this.scrollPos
    } else {
      this.scrollBox.scrollTop -= scrollDist / 2
    }

    if (!this.startTime) {
      this.timerElement.innerHTML = timeToDisplay(0)
    } else if (!this.gameOver) {
      this.timerElement.innerHTML = timeToDisplay(currentTime)
    } else {
      this.timerElement.innerHTML = timeToDisplay(this.endTime)
    }

    requestAnimationFrame(this.update.bind(this))
  }

  handlePressed (key) {
    if (this.gameOver) return

    const currentTime = Date.now() - this.startTime

    const item = this.items.shift()
    if (item !== key) {
      this.lose(currentTime)
      return false
    } else {
      // on first keypress, we start
      // TODO: first correct keypress?
      if (!this.startTime) {
        this.startTime = Date.now()
      }

      this.results.push(currentTime)

      if (!this.items.length) {
        this.endTime = currentTime
        this.scrollPos = 0
        this.gameOver = true
        State.instance.winChallenge({ index: this.levelIndex, time: currentTime })
        this.winCallback(currentTime)
      } else {
        // set the scroll to the next elements top + plus its height (to get it's bottom) and then subtract that by view height
        this.scrollPos = this.hitElements[this.items.length - 1].offsetTop + this.hitElements[this.items.length - 1].clientHeight - this.scrollBox.offsetHeight
      }

      return true
    }
  }

  keyPressed (key) {
    const keyPressed = keyMap[key]
    if (keyPressed && !this.gameOver) {
      const correctPress = this.handlePressed(keyPressed)
      if (correctPress) {
        // shift one for element
        this.tapButtons[keyPressed - 1].classList.add('pressed')
      } else {
        this.tapButtons[keyPressed - 1].classList.add('missed')
        Array.from(this.hitElements[this.items.length].children)[keyPressed - 1].classList.add('missed')
      }
    }
  }

  keyReleased (key) {
    const keyReleased = keyMap[key]
    if (keyReleased && !this.gameOver) {
      this.tapButtons[keyReleased - 1].classList.remove('pressed')
    }
  }

  lose (time) {
    this.gameOver = true
    this.endTime = time
    this.loseCallback()
  }

  tapPressed () {}
}
