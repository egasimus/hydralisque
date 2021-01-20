function initEditor ({host, element, repl}) {

  window.hush   = ()=>{}
  window.render = ()=>{}
  window.o0     = null

  const editor = new (require('hydra/editor.js'))(element)

  const hydra = {
    eval (code) {
      console.log('eval', code)
    }
  }

  const menu = new (require('hydra/menu.js'))({ editor, hydra })

  const gallery = menu.sketches = new (require('hydra/gallery.js'))(
    code => {
      editor.setValue(code)
      hydra.eval(code)
    }
  )

  host.onkeydown = ({ctrlKey, altKey, shiftKey, metaKey, key}) => {
    console.log(ctrlKey, altKey, shiftKey, metaKey, key)
    if (ctrlKey && shiftKey && key === 'Enter') {
       hydra.eval(editor.getValue())
    }
    if (ctrlKey && key === 'Enter') {
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

  return editor
}
