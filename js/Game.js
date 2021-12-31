import State from './State.js'
import { gebi, makeDiv, removeChildElements, sleep, timeToDisplay, validKeys } from './utils.js'

const OPTIONS = 4
const TAP = 'tap'
const HIT_NOTE = 'hit-note'
const MISS_NOTE = 'miss-note'
const scrollBox = gebi('scroll-box')

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

const createDialog = () => {
  const dialog = document.createElement('h2')
  dialog.id = 'dialog'
  scrollBox.appendChild(dialog)
  return dialog
}

export class Game {
  constructor ({ name, pattern, repetitions, limit }, levelIndex, win, lose, isChallenge = false) {
    let items = []
    for (let i = 0; i < repetitions; i++) {
      items = [...items, ...pattern]
    }

    this.id = (Math.random() + '').slice(2)

    removeChildElements(gebi('scroll-box'))
    createElements(items)
    this.tapButtons = Array.from(document.querySelectorAll('.tap-button'))
    this.hitElements = Array.from(document.querySelectorAll('.item-row'))
    this.scrollBox = gebi('scroll-box')
    this.timerElement = createTimer()
    this.dialogElement = createDialog()

    const preferredKeys = State.instance.preferredKeys
    if (preferredKeys === TAP || preferredKeys.length) {
      // keep keys if stored in state
      this.keys = preferredKeys
      if (preferredKeys !== TAP) {
        this.tapButtons.forEach((b, i) => { b.innerText = this.keys[i].toUpperCase() })
      }
      this.setBound()
    } else {
      this.keys = []
      this.dialogElement.innerText = 'Bind keys or tap buttons'
      this.bound = false
    }

    this.scrollPos = this.scrollBox.scrollTop = this.scrollBox.scrollHeight

    this.name = name
    this.pattern = pattern
    this.repetitions = repetitions
    this.items = items
    this.limit = limit
    this.levelIndex = levelIndex
    this.isChallenge = isChallenge
    this.startTime = null
    this.endTime = null
    this.gameOver = false
    this.nearEnd = false
    this.results = []

    this.winCallback = win
    this.loseCallback = lose

    this.tapButtons.forEach(b => {
      b.classList.remove('pressed')
      b.classList.remove('missed')
    })

    // for mobile
    window.scrollTo(0, document.body.scrollHeight)
    this.update()
  }

  update () {
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
      this.timerElement.innerHTML = timeToDisplay(this.endTime > this.limit ? this.limit : this.endTime)
    }

    if (!this.nearEnd && this.startTime && currentTime / this.limit > 0.8) {
      this.timerElement.classList.add('soft-red')
      this.nearEnd = true
    }

    if (!this.gameOver) {
      requestAnimationFrame(this.update.bind(this))
    }
  }

  handlePressed (key) {
    if (this.gameOver) return

    const currentTime = Date.now() - this.startTime

    const item = this.items.shift()
    if (item !== key) {
      this.lose(currentTime)
      return MISS_NOTE
    } else {
      if (!this.startTime) {
        this.startTime = Date.now()
      }

      this.results.push(currentTime)

      const challengeData = {
        name: this.name,
        pattern: this.pattern,
        repetitions: this.repetitions,
        limit: this.limit 
      }

      // if no items left _and_ the off chance we are over the limit
      // but we have not hit the update frame to catch us
      if (!this.items.length && currentTime <= this.limit) {
        this.endTime = currentTime
        this.scrollPos = 0
        this.gameOver = true
        let newBest
        if (this.isChallenge) {
          if (this.levelIndex === -1) {
            this.levelIndex = State.instance.addChallenge(challengeData)
          }
          newBest = State.instance.winChallenge({ index: this.levelIndex, time: currentTime })
        } else {
          newBest = State.instance.winLevel({ index: this.levelIndex, time: currentTime })
        }

        this.winCallback(
          currentTime,
          this.levelIndex,
          newBest
        )
      } else {
        // set the scroll to the next elements top + plus its height (to get it's bottom) and then subtract that by view height
        this.scrollPos = this.hitElements[this.items.length - 1].offsetTop + this.hitElements[this.items.length - 1].clientHeight - this.scrollBox.offsetHeight
      }

      return HIT_NOTE
    }
  }

  async setBound () {
    State.instance.preferredKeys = this.keys
    this.bound = true
    this.dialogElement.innerText = 'Ready!'
    await sleep(500)
    this.dialogElement.innerText = ''
  }

  bindKey (key) {
    if (!this.keyMap(key) && validKeys.includes(key)) {
      this.tapButtons[this.keys.length].innerText = key.toUpperCase()
      this.keys.push(key)

      if (this.keys.length === 4) {
        this.setBound()
      }
    }
  }

  keyMap (key) {
    return this.keys !== TAP && this.keys.indexOf(key) + 1
  }

  pressed (index) {
    const pressResult = this.handlePressed(index)
    if (pressResult === HIT_NOTE) {
      // shift one for element
      this.tapButtons[index - 1].classList.add('pressed')
    } else if (pressResult === MISS_NOTE) {
      this.tapButtons[index - 1].classList.add('missed')
      Array.from(this.hitElements[this.items.length].children)[index - 1].classList.add('missed')
    }
  }

  keyPressed (key) {
    if (key === 'Escape') {
      this.lose(0)
    }

    if (!this.bound) {
      this.bindKey(key)
      return
    }

    const keyPressed = this.keyMap(key)
    if (keyPressed && !this.gameOver) {
      this.pressed(keyPressed)
    }
  }

  keyReleased (key) {
    const keyReleased = this.keyMap(key)
    if (keyReleased && !this.gameOver) {
      this.tapButtons[keyReleased - 1].classList.remove('pressed')
    }
  }

  touchPressed (index) {
    if (this.gameOver) return
    // bound by tapping
    if (!this.bound && !this.keys.length) {
      State.instance.preferredKeys = TAP
      this.keys = TAP
      this.setBound()
      return
    }
    this.pressed(index)
  }

  touchReleased (index) {
    if (this.gameOver) return
    this.tapButtons[index - 1].classList.remove('pressed')
  }

  lose (time) {
    this.gameOver = true
    this.endTime = time
    this.loseCallback(
      this.levelIndex,
      {
        name: this.name,
        pattern: this.pattern,
        repetitions: this.repetitions,
        limit: this.limit 
      }
    )
  }

  destroy () {
    this.tapButtons.forEach(b => { b.innerText = '' })
  }
}
