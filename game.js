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

class Painter {

  static create() {
    return new Painter(canvas())
  }

  constructor(canvas) {
    this._canvas = canvas
  }

  drawSquare(x, y, size, color) {
    this._canvas.fillStyle = color
    this._canvas.fillRect(x, y, size, size)
  }
}

class Loop {

  constructor(renderable, frameRateLimit = 60) {
    this._update = (dt) => renderable.render(dt)
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
      this._update(dt)

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

class SceneRenderer {

  constructor(scene) {
    this._scene = scene
  }

  render(dt) {
    this._scene.render(dt)
  }

  set(scene) {
    this._scene = scene
  }
}

class Game {

  static create(scenes) {
    const firstSceneIndex = 0
    const sceneRenderer = new SceneRenderer(scenes[firstSceneIndex])
    const loop = new Loop(sceneRenderer)
    return new Game(loop, sceneRenderer, firstSceneIndex, scenes)
  }

  constructor(loop, sceneRenderer, firstSceneIndex, scenes) {
    this._loop = loop
    this._sceneRenderer = sceneRenderer
    this._currentSceneIndex = firstSceneIndex
    this._scenes = scenes
  }

  start() {
    this._loop.start()
  }

  stop() {
    this._loop.pause()
  }

  next() {
    if (this._currentSceneIndex < this._scenes.length) {
      this._currentSceneIndex += 1
    } else {
      this._currentSceneIndex = 0
    }
  }

  fps() {
    return this._loop.fps()
  }
}

class Scene {

  constructor(player, world) {
    this._player = player
    this._world = world
  }

  render(dt) {
    this._world.draw()
    this._player.draw()
  }
}

class Player {

  constructor(painter, size = 10, color = '#cc1111') {
    this._painter = painter
    this._size = size
    this._color = color
    this._x = 0
    this._y = 0
  }

  draw() {
    this._painter.drawSquare(this._x, this._y, this._size, this._color)
  }
}

class World {

  constructor(painter, width, height, elementSize, map, mapping) {
    this._painter = painter
    this._width = width
    this._height = height
    this._elementSize = elementSize
    this._map = map
    this._mapping = mapping
  }

  _drawElement(color, x, y) {
    this._painter.drawSquare(x, y, this._elementSize, color)
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

// -

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

const painter = Painter.create()

const world = new World(painter, 10, 10, 40, map, mapping)
const player = new Player(painter)
const scene = new Scene(player, world)

const game = Game.create([scene])
game.start()

const printFps = () => console.log(`fps: ${game.fps()}`)
const printRegularly = () => setTimeout(() => { printFps(); printRegularly()}, 1000)
printRegularly()
