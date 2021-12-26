const patternsToken = 'zzox-patterns-results'

export const NEW_BEST = 'new-best'
export const WIN_LEVEL = 'win-level'

// singleton that gets game state from storage
// keeps track of completed levels and stores them
class State {
  constructor () {
    this.deserialize()
    this.id = (Math.random() + '').slice(3)
  }

  winChallenge ({ index, time }) {
    if (index === this.completedLevels.length) {
      this.completedLevels.push({ time })
    } else {
      if (time < this.completedLevels[index].time) {
        return NEW_BEST
      }
    }
  }

  serialize () {
    // write to json
    // write to storage
  }

  deserialize () {
    // read from storage
    this.completedLevels = []
  }
}

export default { instance: new State() }
