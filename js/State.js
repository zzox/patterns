const patternsToken = 'zzox-patterns-results'

export const NEW_BEST = 'new-best'
export const WIN_LEVEL = 'win-level'

// singleton that gets game state from storage
// keeps track of completed levels and stores them
class State {
  constructor () {
    this.deserialize()
    this.id = (Math.random() + '').slice(3)
    this.preferredKeys = []
  }

  winLevel ({ index, time }) {
    if (index === this.completedLevels.length) {
      this.completedLevels.push({ time })
    } else {
      if (time < this.completedLevels[index].time) {
        this.completedLevels[index].time = time
        return NEW_BEST
      }
    }

    this.serialize()
  }

  addChallenge (challengeData) {
    this.challenges.push(challengeData)
    this.serialize()
    // return the index of the challenge created
    return this.challenges.length - 1
  }

  winChallenge ({ index, time }) {
    if (this.challenges[index].completed && time < this.challenges[index].time) {
      this.challenges[index].time = time
      return NEW_BEST
    } else {
      this.challenges[index].completed = true
      this.challenges[index].time = time
    }

    this.serialize()
  }

  serialize () {
    localStorage.setItem(patternsToken, JSON.stringify({
      completedLevels: this.completedLevels,
      challenges: this.challenges
    }))
  }

  deserialize () {
    let storage = localStorage.getItem(patternsToken)
    const exists = storage != null
    storage = JSON.parse(storage)

    this.completedLevels = exists ? storage.completedLevels : []
    this.challenges = exists ? storage.challenges : []
  }
}

export default { instance: new State() }
