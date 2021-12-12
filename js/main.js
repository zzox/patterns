import { Game } from './Game.js'

console.log('loaded')

const run = () => {  
  // MD: from menu later
  const game = new Game([1,2,3,4], 16, 10000)

  document.addEventListener('keydown', (event) => {
    console.time('test')

    game.keyPressed(event.key)

    console.timeEnd('test')
  })

  document.addEventListener('keyup', (event) => {
    game.keyReleased(event.key)
  })

  // TODO: add touch event listeners for each button div
}

run()
