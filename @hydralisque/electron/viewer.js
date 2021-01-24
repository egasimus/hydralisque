module.exports = initViewer

function initViewer ({
  host   = window,
  canvas = initCanvas(document.getElementById('hydra-canvas')),
  events = require('electron').ipcRenderer
}={}) {

  const P5 = host.P5 =
    require('@hydralisque/editor/p5-wrapper.js')

  const patchbay = host.pb =
    new (require('@hydralisque/editor/pb-live.js'))()

  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !host.MSStream;

  const precision =
    isIOS ? 'highp' : 'mediump'

  const autoLoop =
    false

  const hydra =
    new (require('@hydralisque/synth'))({
      patchbay, canvas, autoLoop, precision
    })

  const log =
    require('@hydralisque/editor/log.js')

  log.init()

  // define extra functions (eventually should be added to hydra-synth?)
  host.hush = () => { // clears what you see on the screen
    solid().out()
    solid().out(o1)
    solid().out(o2)
    solid().out(o3)
    render(o0)
  }

  patchbay.init(hydra.captureStream, {
    server: host.location.origin,
    room: 'iclc'
  })

  const engine = require('raf-loop')(
    hydra.tick.bind(hydra)
  ).start()

  events.on('eval', (code) => {
    console.log('eval', code)
    console.log(hydra)
    hydra.eval(code)
  })

  host.cc = require("./midi")()

  return engine
}

function initCanvas (canvas) {
  canvas.style = {}
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.bottom = '0';
  canvas.style.left = '0';
  canvas.style.right = '0';
  canvas.style.background = '#000';
  return canvas
}
