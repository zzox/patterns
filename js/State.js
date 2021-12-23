const patternsToken = 'zzox-patterns-results'

// singleton that gets game state from storage
// keeps track of completed levels and stores them
class State {
  constructor () {
    this.deserialize()
    this.id = (Math.random() + '').slice(3)
  }

  serialize () {
    // write to json
    // write to storage
  }

  deserialize () {
    // read from storage
  }
}

export default { instance: new State }
