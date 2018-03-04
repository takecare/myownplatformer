// requestAnimationFrame() should be used when you want to update anything before the browser
// runs the next painting cycle. you pass it a callback to do whatever you want just before
// that moment. browsers will try to run callbacks passed to this method at 60 fps.

// knowing how much time was elapsed since the last udpate is key to animating things on the
// screen. let's say you want an object to move, linearly, from A to B in X seconds. if the
// amount of time the screen takes to update is dT and the distance to travel is K, this means
// that your object must move

const canvas = (id = 'canvas') => {
  const _canvas = document.getElementById(id)
  if (_canvas.getContext) {
    const context = _canvas.getContext('2d')
    // context.clearRect(0, 0, _canvas.width, _canvas.height)
    context.strokeRect(3, 3, _canvas.width - 3, _canvas.height - 3);
    return context
  }
  throw `can't find canvas with id '${id}'`
}

class Loop {

  constructor(painter, frameRateLimit = 60) {
    this._painter = painter
    this._frameRateLimit = frameRateLimit
    this._lastTimestamp = null
    this._id = null
    this._loop = null
  }

  _createInnerLoop() {
    this._lastTimestamp = performance.now()
    return (currentTimestamp = this._lastTimestamp) => {
      this._id = window.requestAnimationFrame(this._loop)

      if (currentTimestamp < this._lastTimestamp + (1000 / this._frameRateLimit)) {
        return this._id
      }

      const dt = currentTimestamp - this._lastTimestamp
      this._lastTimestamp = currentTimestamp
      this._painter(dt)

      return this._id
    }
  }

  start() {
    this._loop = this._createInnerLoop()
    this._loop()
  }

  pause() {
    window.cancelAnimationFrame(this._id)
  }

  continue() {
    this._loop()
  }
}

let x = 0
const draw = dt => canvas().fillRect(x++ * dt, 0, 25, 25)

const k = new Loop(draw)
k.start()
setTimeout(() => k.pause(), 250)
setTimeout(() => k.continue(), 550)