const FADE_TIME = 20

class Audio {
  constructor () {
    this.sounds = {}
    this.audioCtx = new AudioContext()
    this.gainNode = this.audioCtx.createGain()
    this.gainNode.connect(this.audioCtx.destination)
    this.muted = true

    this.addSound('C1')
    this.addSound('D1')
    this.addSound('E1')
    this.addSound('G1')
    this.addSound('A1')
    this.addSound('C2')
    this.addSound('D2')
    this.addSound('Cmaj7')
    this.addSound('Emin7')
    this.addSound('Cs')
  }

  addSound (name) {
    this.sounds[name] = { sound: null }

    const request = new XMLHttpRequest()
    request.open('GET', `./assets/${name}.mp3`)
    request.responseType = 'arraybuffer'
    request.onload = () => {
      this.audioCtx.decodeAudioData(request.response, (data) => {
        this.sounds[name].buffer = data
      })
    }
    request.send()
  }

  // create a buffer source and attach the loader buffer.
  // attach buffer source to gain and attach a temporary
  // audioSourceBuffer to pause if necessary
  playSound (note) {
    try {
      const source = this.audioCtx.createBufferSource()
      source.buffer = this.sounds[note].buffer
      source.connect(this.gainNode)
      this.sounds[note].audio = source
      // reset the audio item to null when ended
      source.addEventListener('ended', () => { this.sounds[note].audio = null })
      source.start()
    } catch (e) {
      console.warn(e)
    }
  }

  mute () {
    this.muted = !this.muted
    if (this.muted) {
      this.audioCtx.resume()
    }
    this.gainNode.gain.linearRampToValueAtTime(this.muted ? 0 : 1, this.audioCtx.currentTime + FADE_TIME)
  }
}

export default { instance: new Audio() }
