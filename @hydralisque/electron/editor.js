const {ipcRenderer} = require('electron')

function initEditor ({
  host,
  element,
  events = require('electron').ipcRenderer
}) {

  Object.assign(host, {
    hush () {},
    render () {},
    o0: null,
    onkeydown ({ctrlKey, altKey, shiftKey, metaKey, key}) {
      console.debug(ctrlKey, altKey, shiftKey, metaKey, key)
      if (ctrlKey && shiftKey && key === 'Enter') {
         engine.eval(editor.getValue())
      } else if (ctrlKey && key === 'Enter') {
         engine.eval(editor.getLine())
      }
    }
  })

  host.hush   = ()=>{}
  host.render = ()=>{}
  host.o0     = null

  const engine = {
    eval (code) {
      console.debug('eval', code)
      events.send('eval', code)
      //viewers.eval(code)
    },
    seek (t) {
      console.debug('seek', t)
      events.send('seek', t)
    }
  }

  const editor =
    new (require('@hydralisque/editor/Editor'))({
      container: document.getElementById('editor-container'),
      hydra: engine
    })

  const menu =
    new (require('@hydralisque/editor/Menu'))({ editor, hydra: engine })

  const viewers =
    initViewers(document.getElementById('viewers'))

  const gallery = menu.sketches =
    new (require('@hydralisque/editor/Gallery'))(
      code => {
        editor.setValue(code)
        engine.eval(code)
      }
    )

  const palette = initPalette(document.getElementById('palette'), gallery)

  //require('hydra/keymaps.js')({
    //history: host.history,
    //editor,
    //gallery,
    //menu,
    //log: console.log
  //})

  const midi = document.getElementById('midi-monitor')
  const ccs = []
  for (let i = 0; i < 128; i++) {
    ccs[i] = midi.appendChild(
      document.createElement('div'))
  }
  require("./midi")((index,value)=>{
    ccs[index].innerText = `cc[${index}]=${value}`
  })

  const timeline = document.getElementById('timeline')
  initTimeline(timeline, engine)

  return editor
}

function initPalette (host, gallery) {
  for (let {sketch_id, code} of gallery.examples) {
    host.appendChild(Object.assign(document.createElement('a'), {
      innerText: sketch_id,
      href:      code
    }))
  }
}

function initViewers (container) {
  return { eval () {} }

  const outputs = [0,1,2,3]
  const viewers = outputs.map(initViewer)

  return {
    eval (code) {
      console.log(123,viewers)
      for (let output of outputs) {
        console.log(12, output, viewers[output])
        viewers[output].eval(code)
      }
    }
  }

  function initViewer (o) {
    const canvas = container.appendChild(Object.assign(document.createElement('canvas'),
      { width: 160, height: 120, style: 'background:black' }))
    const events = new (require('events').EventEmitter)()
    const engine = require('./viewer')({host:window, canvas, events})
    const eval = code => events.emit('eval', `${code}\n;render(o${o});`)
    return { canvas, events, engine, eval }
  }

}

function initTimeline (container, engine) {

  const T0 = + new Date()
  let T = T0

  container.appendChild(Object.assign(document.createElement('div'), {
    innerText: '0'
  }))

  container.appendChild(Object.assign(document.createElement('hr'), {
    className: 'flex-grow',
    onclick (event) {
      const seekTarget = (T-T0)*event.offsetX/event.target.offsetWidth
      engine.seek(seekTarget)
    }
  }))

  const currentTime = container.appendChild(Object.assign(document.createElement('div'), { innerText: + new Date() - T0 }))
  require('raf-loop')(dt=>{
    T += dt
    currentTime.innerText = ((T-T0)/1000).toFixed(3) + 's'
    //console.log('raf',args)
  }).start()

}
