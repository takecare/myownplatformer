var last = null
const onFrame = timestamp => {
  if (!last) {
    last = timestamp
  }
  console.log(`amount of time since last update: ${timestamp - last} ms`)
  last = timestamp
  window.requestAnimationFrame(onFrame)
}
//window.requestAnimationFrame(onFrame)

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
    context.clearRect(0, 0, _canvas.width, _canvas.height)
    context.strokeRect(3, 3, _canvas.width - 3, _canvas.height - 3);
    return context
  }
  throw `can't find canvas with id '${id}'`
}

var __lastTimestamp = performance.now()
console.log(__lastTimestamp) // ...
var f = true
const requestCallback = callback => currentTimestamp => {
  const dt = currentTimestamp - __lastTimestamp
  if (f) {
    f=false
    console.log(currentTimestamp, dt) // ...
  }
  __lastTimestamp = currentTimestamp
  callback(dt)
  requestAnimationFrame(requestCallback(callback))
}
const loop = callback => window.requestAnimationFrame(requestCallback(callback))

// setTimeout(() => console.log('>>> TIMEOUT <<<'), duration)

const draw = dt => {
  canvas().fillRect(0, 0, 25, 25)
}
loop(draw)
