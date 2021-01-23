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
      console.log('eval', code)
      ipcRenderer.send('eval', code)
    }
  }

  const editor =
    new (require('hydra-editor/editor.js'))(hydra)

  const menu =
    new (require('hydra-editor/menu.js'))({ editor, hydra })

  const gallery = menu.sketches =
    new (require('hydra-editor/gallery.js'))(
      code => {
        editor.setValue(code)
        hydra.eval(code)
      }
    )

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
