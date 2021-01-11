function initViewer ({host, element, repl}) {
  const canvas = initCanvas(element)
  host.P5 = require('hydra/hydra-server/app/src/p5-wrapper.js')
  const pb = host.pb = new (require('hydra/hydra-server/app/src/pb-live.js'))()
  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !host.MSStream;
  const precision = isIOS ? 'highp' : 'mediump'
  const autoLoop = false
  const hydra = new (require('hydra-synth'))({ pb, canvas, autoLoop, precision })
  const log = require('hydra/hydra-server/app/src/log.js')
  const repl = require('hydra/hydra-server/app/src/repl.js')
  log.init()
  // get initial code to fill gallery
  // define extra functions (eventually should be added to hydra-synth?)
  host.hush = () => { // clears what you see on the screen
    solid().out()
    solid().out(o1)
    solid().out(o2)
    solid().out(o3)
    render(o0)
  }
  pb.init(hydra.captureStream, { server: host.location.origin, room: 'iclc' })
  const engine = require('raf-loop')(hydra.tick.bind(hydra)).start()
  return engine
}

