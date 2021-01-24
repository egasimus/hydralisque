const {ipcRenderer} = require('electron')

function initEditor ({
  host,
  element,
  repl
}) {

  host.hush   = ()=>{}
  host.render = ()=>{}
  host.o0     = null

  const hydra = {
    eval (code) {
      console.debug('eval', code)
      ipcRenderer.send('eval', code)
      viewers.eval(code)
    }
  }

  const editor =
    new (require('@hydralisque/editor/editor.js'))({
      container: document.getElementById('editor-container'),
      hydra
    })

  const menu =
    new (require('@hydralisque/editor/menu.js'))({ editor, hydra })

  const viewers =
    initViewers(document.getElementById('viewers'))

  const gallery = menu.sketches =
    new (require('@hydralisque/editor/gallery.js'))(
      code => {
        editor.setValue(code)
        hydra.eval(code)
      }
    )

  const palette = initPalette(document.getElementById('palette'), gallery)

  host.onkeydown = ({ctrlKey, altKey, shiftKey, metaKey, key}) => {
    console.log(ctrlKey, altKey, shiftKey, metaKey, key)
    if (ctrlKey && shiftKey && key === 'Enter') {
       hydra.eval(editor.getValue())
    } else if (ctrlKey && key === 'Enter') {
       hydra.eval(editor.getLine())
    }
  }

  //require('hydra/keymaps.js')({
    //history: host.history,
    //editor,
    //gallery,
    //menu,
    //repl,
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
