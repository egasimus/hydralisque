const PatchBay = require('./src/pb-live.js')
const HydraSynth = require('hydra-synth')
const Editor = require('./src/editor.js')
const loop = require('raf-loop')
const Gallery  = require('./src/gallery.js')
const Menu = require('./src/menu.js')
const keymaps = require('./keymaps.js')
const log = require('./src/log.js')
const repl = require('./src/repl.js')

// side effect of module load -> TRES BAD!
window.onload = init

function init (
  host = window // modifying (or even depending on)
                // the global scope via `window`:
                // ALSO VERY BAD
) {

  // depending on variable hoisting but not function hoisting
  // do you read sentences in reverse?
  const pb = host.pb = new PatchBay()

  // nice shadow global reexport ltd.;
  const P5 = host.P5 = require('./src/p5-wrapper.js')

  // `document` is still somehow okay though?! :D
  const canvas = document.getElementById('hydra-canvas')

  // canvas.width = host.innerWidth * host.devicePixelRatio
  // canvas.height = host.innerHeight * host.devicePixelRatio

  // 2021 and still no nested Object.assign
  canvas.width = host.innerWidth
  canvas.height = host.innerHeight 
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.imageRendering = 'pixelated'

  let isIOS = // darn apple
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !host.MSStream;

  const hydra = new HydraSynth({
    pb,
    canvas,
    autoLoop: false,
    precision: isIOS ? 'highp' : 'mediump'
  })

  const editor = new Editor()
  const menu = new Menu({ editor, hydra })
  log.init()

  keymaps.init ({

    editor,

    gallery: menu.sketches = new Gallery(function(code, sketchFromURL) {
      editor.setValue(code)
      repl.eval(code)

      // if a sketch was found based on the URL parameters, dont show intro window
      if(sketchFromURL) {
        menu.closeModal()
      } else {
        menu.openModal()
      }
    }),

    menu,
    repl,
    log

  })

  // define extra functions (eventually should be added to hydra-synth?)

  // hush clears what you see on the screen
  host.hush = () => {
    solid().out()
    solid().out(o1)
    solid().out(o2)
    solid().out(o3)
    render(o0)
  }

  pb.init(hydra.captureStream, {
    server: host.location.origin,
    room: 'iclc'
  })

  var engine = loop(function(dt) {
    hydra.tick(dt)
  }).start()

}

