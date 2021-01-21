const {ipcRenderer} = require('electron')

function initViewer ({
  host,
  element,
  repl = require('hydra/repl.js')
}) {

  const canvas =
    initCanvas(element)

  host.P5 =
    require('hydra/p5-wrapper.js')

  const pb = host.pb =
    new (require('hydra/pb-live.js'))()

  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !host.MSStream;

  const precision =
    isIOS ? 'highp' : 'mediump'

  const autoLoop =
    false

  const hydra =
    new (require('hydra-synth'))({
      pb, canvas, autoLoop, precision
    })

  const log =
    require('hydra/log.js')
  log.init()

  // define extra functions (eventually should be added to hydra-synth?)
  host.hush = () => { // clears what you see on the screen
    solid().out()
    solid().out(o1)
    solid().out(o2)
    solid().out(o3)
    render(o0)
  }

  pb.init(hydra.captureStream,
    { server: host.location.origin, room: 'iclc' })

  const engine = require('raf-loop')(
    hydra.tick.bind(hydra)
  ).start()

  ipcRenderer.on('eval', (event, code) => {
    console.log('eval', code)
    hydra.eval(code)
  })

  return engine
}

function initCanvas (canvas) {
  canvas.style = {}
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.bottom = '0';
  canvas.style.left = '0';
  canvas.style.right = '0';
  canvas.style.background = '#012';
  return canvas
}
