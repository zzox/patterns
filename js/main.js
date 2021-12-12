console.log('loaded')

const validKeys = ['abcdefghijklmnopqrstuvwxyz0123456789,./-=']

const OPTIONS = 4

// MD:
const pattern = [1,2,3,4]
const repetitions = 16
const keyMap = { 'a': 1, 's': 2, 'd': 3, 'f': 4 }
const results = []

const makeDiv = (className) => {
  const div = document.createElement('div')
  div.className = className
  return div
}

let items = []
for (let i = 0; i < repetitions; i++) {
  items = [...items, ...pattern]
}

console.log(items)

const createElements = () => {
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

// destroy elements

const run = () => {
  let start

  const hitElements = Array.from(document.querySelectorAll('.item-row'))
  const scrollBox = document.getElementById('scroll-box')
  console.log(hitElements[items.length - 1].getBoundingClientRect())
  // scrollBox.scrollTo(0, hitElements[items.length - 1].getBoundingClientRect().y) // to make sure we go past
  let scrollPos = scrollBox.scrollTop = scrollBox.scrollHeight
  

  // const boxHeight = scrollBox.getBoundingClientRect().height

  // get keys
  // maybe pass these to whatever class we have?
  // or should this just get handled in the class itself?
  document.addEventListener('keydown', (event) => {
    // keep in these time tests
    console.time('test')

    // if we've selected one of the keys, we evaluate if it's the right one.
    const key = keyMap[event.key]    
    if (key) {
      const item = items.shift()
      if (item !== key) {
        throw new Error('Lose!')
      } else {
        // on first keypress, we start
        // TODO: first correct keypress?
        if (!start) {
          start = Date.now()
        }

        console.log('key pressed', event.key, Date.now() - start)

        // animate and move on

        // get a lastTime val
        results.push(Date.now() - start)

        if (!items.length) {
          console.log(results)
          scrollBox.scrollTop = 0;
          scrollPos = 0;
          throw new Error(`Won! ${Date.now() - start}`)
        } else {
          // top of the scrollbox = previous position subtracted by (height of the scrollBox (outer) subtracted by the bottom of the next box)
          // done this way instead of subtracting by the element height because that may get out of sync due to
          // floating point (bounding rect) vs int (scrollTop)s math
          // basically we are getting the distance to the next element
          scrollBox.scrollTop -= scrollBox.getBoundingClientRect().height - hitElements[items.length - 1].getBoundingClientRect().bottom
          scrollPos -= scrollBox.getBoundingClientRect().height - hitElements[items.length - 1].getBoundingClientRect().bottom
          console.log(scrollPos)
        }
      }
    }

    console.timeEnd('test')
  })
  // remember to: document.removeEventListener()
}

createElements()
run()
