function initEditor ({host, element, repl}) {
  const editor = new (require('hydra/hydra-server/app/src/editor.js'))(element)
  const menu = new (require('hydra/hydra-server/app/src/menu.js'))({ editor, hydra })
  const gallery = menu.sketches = new (require('hydra/hydra-server/app/src/gallery.js'))(code => {
    editor.setValue(code)
    repl.eval(code)
  })
  host.onkeydown = require('./keymaps.js')({
    history: host.history, editor, gallery, menu, repl, log
  })
  return editor
}
