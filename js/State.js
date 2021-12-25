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
    if (index === this.completedChallenges.length) {
      this.completedChallenges.push({ time })
    } else {
      if (time < this.completedChallenges[index].time) {
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
    this.completedChallenges = []
  }
}

export default { instance: new State }
