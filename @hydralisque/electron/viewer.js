module.exports = initViewer

function initViewer ({
  host   = window,
  canvas = initCanvas(host, document.getElementById('hydra-canvas')),
  events = require('electron').ipcRenderer
}={}) {

  require('@hydralisque/editor/Log').init()

  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !host.MSStream;

  Object.assign(host, {
    cc: require('./midi')(),
    // define extra functions (eventually should be added to hydra-synth?)
    hush () { // clears what you see on the screen
      solid().out()
      solid().out(o1)
      solid().out(o2)
      solid().out(o3)
      render(o0)
    },
  })

  const { engine, mainLoop } = initEngine({
    events,

    server: host.location.origin,
    patchbay: new (require('@hydralisque/editor/PatchBay.js'))(),

    canvas,
    autoLoop: false,
    precision: isIOS ? 'highp' : 'mediump'
  })

  host.onresize = event => {
    const {innerWidth, innerHeight} = event.target
    engine.setResolution(innerWidth, innerHeight)
  }

  return mainLoop
}

function initEngine ({
  events, IPCChannel = 'hydra',
  patchbay, server,
  canvas, autoLoop, precision
}) {
  const engine = new (require('@hydralisque/synth'))({
    patchbay, canvas, autoLoop, precision
  })

  if (patchbay) patchbay.init(
    engine.captureStream,
    { server, room: 'iclc' }
  )

  let paused = false
  const mainLoop = require('raf-loop')(
    engine.tick.bind(engine)
  ).start()

  events.on(IPCChannel, (event, {
    eval,
    seek,
    pause
  }) => {

    if (eval) engine.eval(eval)

    if (seek) engine.seek(seek)

    switch (pause) {
      case true:
        paused = true
        mainLoop.stop()
        break
      case false:
        paused = false
        mainLoop.start()
        break
      case 'toggle':
        paused ? mainLoop.start() : mainLoop.stop();
        paused = !paused
    }

  })

  return { engine, mainLoop }
}

function initCanvas (host, canvas) {
  canvas.width = host.innerWidth
  canvas.height = host.innerHeight

  canvas.style = {}
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.bottom = '0';
  canvas.style.left = '0';
  canvas.style.right = '0';
  canvas.style.background = '#000';
  return canvas
}
