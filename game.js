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
    return context = _canvas.getContext('2d')
  }
  throw `can't find canvas with id '${id}'`
}

class Renderer {

  constructor(canvas) {
    this._canvas = canvas
  }

  drawSquare(x, y, size, color) {
    this._canvas.fillStyle = color
    this._canvas.fillRect(x, y, size, size)
  }
}

class World {

  constructor(renderer, width, height, elementSize, map, mapping) {
    this._renderer = renderer
    this._width = width
    this._height = height
    this._elementSize = elementSize
    this._map = map
    this._mapping = mapping
  }

  _drawElement(color, x, y) {
    this._renderer.drawSquare(x, y, this._elementSize, color)
  }

  draw() { // TODO ignoring dt for now...
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        this._drawElement(
          this._mapping[this._map[y * this._width + x]],
          this._elementSize * x,
          this._elementSize * y
        )
      }
    }
  }
}

class Loop {

  constructor(world, frameRateLimit = 60) {
    this._renderWorld = () => world.draw()
    this._frameRateLimit = frameRateLimit
    this._lastTimestamp = null
    this._id = null
    this._loop = null

    this._frameCounter = 0
    this._lastFpsCountTimestamp = null
  }

  // the inner loop allows us to encapsulate details like the requestAnimationFrame callback id
  _createInnerLoop() {
    // capture the first timestamp. this assumes you'll immediately call the returned function right away
    this._lastTimestamp = performance.now()

    return (currentTimestamp = this._lastTimestamp) => {
      this._id = window.requestAnimationFrame(this._loop)

      // skip this frame due to an issue with chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=268213
      if (currentTimestamp < this._lastTimestamp + (1000 / this._frameRateLimit)) {
        return this._id
      }

      const dt = currentTimestamp - this._lastTimestamp
      this._lastTimestamp = currentTimestamp
      this._renderWorld(dt)

      this._updateFpsCount(currentTimestamp)

      return this._id
    }
  }

  _updateFpsCount(currentTimestamp) {
    this._frameCounter += 1

    if (!this._lastFpsCountTimestamp) {
      this._lastFpsCountTimestamp = currentTimestamp
    }

    // if 1sec or more has passed, it's time to reset the counter
    if (currentTimestamp - this._lastFpsCountTimestamp >= 1000) {
      this._fps = this._frameCounter
      this._frameCounter = 0
      this._lastFpsCountTimestamp = currentTimestamp
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

  fps() {
    return this._fps ? this._fps : this._frameCounter
  }
}


const map = [
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,0,0,0,0,
  0,0,0,0,0,0,0,0,1,1,
  1,0,0,0,0,0,0,0,0,0,
  1,0,0,0,0,0,0,0,0,0,
  1,1,1,1,1,0,1,1,1,1,
  1,1,1,1,1,0,1,1,1,1,
]

const mapping = {
  0: 'lightblue',
  1: '#5d995d'
}

const renderer = new Renderer(canvas())
const world = new World(renderer, 10, 10, 40, map, mapping)
const game = new Loop(world)
game.start()

const printFps = () => console.log(`fps: ${game.fps()}`)
const printRegularly = () => setTimeout(() => { printFps(); printRegularly()}, 1000)
printRegularly()