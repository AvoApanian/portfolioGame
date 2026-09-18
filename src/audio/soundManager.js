import logger from '../utils/logger'

class SoundManager {
  constructor() {
    this.ctx = null
    this.master = null
    this.sfxGain = null
    this.musicGain = null
    this.sfxMuted = false
    this.musicMuted = false
    this.thrust = null
    this.musicNodes = null
  }

  init() {
    if (this.ctx) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) {
      logger.warn('Audio', 'Web Audio API unavailable')
      return
    }

    this.ctx = new AudioCtx()
    this.master = this.ctx.createGain()
    this.master.gain.value = 1
    this.master.connect(this.ctx.destination)

    this.sfxGain = this.ctx.createGain()
    this.sfxGain.gain.value = this.sfxMuted ? 0 : 0.5
    this.sfxGain.connect(this.master)

    this.musicGain = this.ctx.createGain()
    this.musicGain.gain.value = this.musicMuted ? 0 : 0.16
    this.musicGain.connect(this.master)

    this._setupThrust()
    this._setupMusic()

    logger.info('Audio', 'Audio engine started')
  }

  setSfxMuted(muted) {
    this.sfxMuted = muted
    if (this.sfxGain) {
      this.sfxGain.gain.linearRampToValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime + 0.15)
    }
    logger.info('Audio', 'Sound effects toggled', { muted })
  }

  setMusicMuted(muted) {
    this.musicMuted = muted
    if (this.musicGain) {
      this.musicGain.gain.linearRampToValueAtTime(muted ? 0 : 0.16, this.ctx.currentTime + 0.6)
    }
    logger.info('Audio', 'Background music toggled', { muted })
  }

  _setupThrust() {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 55

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 200

    const gain = ctx.createGain()
    gain.gain.value = 0

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)
    osc.start()

    this.thrust = { osc, filter, gain }
  }

  updateThrust(speedPct, boosting) {
    if (!this.ctx || !this.thrust) return
    const t = this.ctx.currentTime
    const targetGain = speedPct > 0.02 ? 0.05 + speedPct * (boosting ? 0.22 : 0.13) : 0
    const targetFreq = 55 + speedPct * (boosting ? 190 : 110)

    this.thrust.gain.gain.setTargetAtTime(targetGain, t, 0.08)
    this.thrust.osc.frequency.setTargetAtTime(targetFreq, t, 0.12)
    this.thrust.filter.frequency.setTargetAtTime(180 + speedPct * 900, t, 0.15)
  }

  _setupMusic() {
    const ctx = this.ctx
    const notes = [55, 82.4, 110, 164.8]
    const oscillators = []

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq

      const gain = ctx.createGain()
      gain.gain.value = 0.22 / notes.length

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.musicGain)
      osc.start()

      oscillators.push({ osc, gain })
    })

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 6

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    this.musicNodes = { oscillators, lfo, filter }
    logger.info('Audio', 'Background music initialised')
  }

  _blip({ freq = 440, duration = 0.12, type = 'sine', endFreq, gainValue = 0.35 }) {
    if (!this.ctx) return
    const ctx = this.ctx
    const t = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(gainValue, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  }

  playUiClick() {
    this._blip({ freq: 720, endFreq: 480, duration: 0.07, type: 'square', gainValue: 0.18 })
  }

  playPanelOpen() {
    this._blip({ freq: 320, endFreq: 640, duration: 0.18, type: 'triangle', gainValue: 0.22 })
  }

  playPanelClose() {
    this._blip({ freq: 640, endFreq: 260, duration: 0.14, type: 'triangle', gainValue: 0.2 })
  }

  playOrbitChime() {
    if (!this.ctx) return
    this._blip({ freq: 523, endFreq: 784, duration: 0.35, type: 'sine', gainValue: 0.28 })
    setTimeout(() => this._blip({ freq: 659, endFreq: 988, duration: 0.4, type: 'sine', gainValue: 0.22 }), 90)
  }

  playBoostStart() {
    if (!this.ctx) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const bufferSize = ctx.sampleRate * 0.4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(300, t)
    filter.frequency.exponentialRampToValueAtTime(2200, t + 0.35)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.22, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)
    noise.start(t)
  }
}

const soundManager = new SoundManager()
export default soundManager
