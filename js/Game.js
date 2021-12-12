import { makeDiv, removeChildElements } from './utils.js'

const OPTIONS = 4

const createElements = (items) => {
  const scrollBox = document.getElementById('scroll-box')

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

// TEMP: build in the class later
const keyMap = { 'a': 1, 's': 2, 'd': 3, 'f': 4 }

export class Game {
  constructor (pattern, repetitions, limit) {
    let items = []
    for (let i = 0; i < repetitions; i++) {
      items = [...items, ...pattern]
    }

    createElements(items)

    this.hitElements = Array.from(document.querySelectorAll('.item-row'))
    this.scrollBox = document.getElementById('scroll-box')

    this.scrollPos = this.scrollBox.scrollTop = this.scrollBox.scrollHeight

    this.items = items
    this.limit = limit
    this.startTime = null
    this.results = []

    this.update(0)
  }

  update (time) {
    // attempt 1:
    const scrollDist = this.scrollBox.scrollTop - this.scrollPos
    console.log(scrollDist)
    if (scrollDist < 2) {
      this.scrollBox.scrollTop = this.scrollPos
    } else {
      this.scrollBox.scrollTop -= scrollDist / 2
    }

    // update scroll position
    requestAnimationFrame(this.update.bind(this))
  }

  handlePressed (key) {
    const item = this.items.shift()
    if (item !== key) {
      throw new Error('Lose!')
    } else {
      // on first keypress, we start
      // TODO: first correct keypress?
      if (!this.startTime) {
        this.startTime = Date.now()
      }

      // animate and move on

      // get a lastTime val
      this.results.push(Date.now() - this.startTime)

      if (!this.items.length) {
        console.log(this.results)
        this.scrollPos = 0;
        throw new Error(`Won! ${Date.now() - this.startTime}`)
      } else {
        // set the scroll to the next elements top + plus its height (to get it's bottom) and then subtract that by view height
        this.scrollPos = this.hitElements[this.items.length - 1].offsetTop + this.hitElements[this.items.length - 1].clientHeight - this.scrollBox.offsetHeight
      }
    }
  }

  keyPressed (key) {
    const keyPressed = keyMap[key]
    if (keyPressed) {
      this.handlePressed(keyPressed)
    }
  }

  tapPressed () {}
}