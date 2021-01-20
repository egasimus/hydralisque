function initEditor ({host, element, repl}) {

  const editor = new (require('hydra/editor.js'))(element)

  //const menu = new (require('hydra/menu.js'))({ editor, hydra })

  window.hush = () => {}
  const gallery = /*menu.sketches =*/ new (require('hydra/gallery.js'))(code => {
    editor.setValue(code)
    repl.eval(code)
  })

  host.onkeydown = require('hydra/keymaps.js')({
    history: host.history,
    editor,
    gallery,
    //menu,
    repl,
    log
  })

  return editor

}
