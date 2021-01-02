function init (host) {
  host.P5 = require('./p5-wrapper.js')
  const pb = host.pb = new (require('./pb-live.js'))()
  const canvas = initCanvas(document.getElementById('hydra-canvas'))
  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !host.MSStream;
  const precision = isIOS ? 'highp' : 'mediump'
  const autoLoop = false
  const hydra = new (require('hydra-synth'))({ pb, canvas, autoLoop, precision })
  const editor = new (require('./editor.js'))()
  const menu = new (require('./menu.js'))({ editor, hydra })
  const log = require('./log.js')
  const repl = require('./repl.js')
  log.init()
  // get initial code to fill gallery
  const gallery = menu.sketches = new (require('./gallery.js'))(loadSketch)
  host.onkeydown = require('./keymaps.js')({
    history: host.history, editor, gallery, menu, repl, log
  })
  // define extra functions (eventually should be added to hydra-synth?)
  host.hush = () => { // clears what you see on the screen
    solid().out()
    solid().out(o1)
    solid().out(o2)
    solid().out(o3)
    render(o0)
  }
  pb.init(hydra.captureStream, { server: host.location.origin, room: 'iclc'  })
  const engine = require('raf-loop')(hydra.tick.bind(hydra)).start()
  return engine

  function loadSketch (code, sketchFromURL) {
    editor.setValue(code)
    repl.eval(code)
  }
}

function initCanvas (canvas) {
  // canvas.width = window.innerWidth * window.devicePixelRatio
  // canvas.height = window.innerHeight * window.devicePixelRatio
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight 
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.imageRendering = 'pixelated'
  return canvas
}
