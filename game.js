var last = null

const onFrame = timestamp => {
  if (!last) {
    last = timestamp
  }

  console.log(`amount of time since last update: ${timestamp - last} ms`)
  last = timestamp

  window.requestAnimationFrame(onFrame)
}

// requestAnimationFrame() should be used when you want to update anything before the browser
// runs the next painting cycle. you pass it a callback to do whatever you want just before
// that moment. browsers will try to run callbacks passed to this method at 60 fps.

window.requestAnimationFrame(onFrame)