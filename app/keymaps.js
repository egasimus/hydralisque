module.exports = function initKeymap ({history, editor, gallery, menu, repl, log}) {

  const keymap = {

    Ctrl: {

      // Ctrl-Enter: evalLine
      13: () => repl.eval(editor.getLine()),

      // Ctrl-/: toggle comment
      191: () => editor.cm.toggleComment(),

      Alt: {

        // Ctrl-Alt-Left
        37: () => history.back(),

        // Ctrl-Alt-Right
        39: () => history.forward(),

        // Ctrl-Alt-Up
        38: () => editor.mutator.doRedo(),

        // Ctrl-Alt-Down
        40: () => {
          editor.mutator.mutate({reroll: true})
          gallery.saveLocally(editor.getValue())
        }

      },

      Shift: {
        // Ctrl+Shift+Enter: evalAll
        13: () => menu.runAll(),

        // Ctrl-Shift-G: share sketch
        71: () => menu.shareSketch(),

        // Ctrl-Shift-F: format code
        70: () => menu.formatCode(),

        // Ctrl-Shift-L: save to url
        76: () => gallery.saveLocally(editor.getValue()),

        // Ctrl-Shift-H: toggle editor
        72: () => { editor.toggle(); log.toggle() },

        // Ctrl-Shift-S: screencap
        83: () => screencap() 

      },

    },

    Alt: {
      // Alt-Enter: evalBlock
      13: () => repl.eval(editor.getCurrentBlock().text)
    }

  }

  return function onkeydown (e) {
    let keys = keymap
    let combo = ''
    if (e.ctrlKey) {
      keys = keys.Ctrl || {}
      combo += 'Ctrl-'
    }
    if (e.altKey) {
      keys = keys.Alt || {}
      combo += 'Alt-'
    }
    if (e.shiftKey) {
      keys = keys.Shift || {}
      combo += 'Shift-'
    }
    combo += e.keyCode
    if (keys[e.keyCode]) {
      e.preventDefault()
      console.debug(combo)
      keys[e.keyCode]()
    }
  }

}
