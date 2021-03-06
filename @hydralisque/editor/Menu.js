class Menu {

  constructor ({
    sketches,
    editor,
    engine
  }={}) {

    Object.assign(this, {
      sketches,
      editor,
      engine
    })

    document.getElementById("run-icon").onclick = () =>
      this.engine.eval(this.editor.getValue(), (string, err) => {
       // console.log('eval', err)
       this.editor.flashCode()
        if(!err) this.sketches.saveLocally(this.editor.getValue())
      })

    document.getElementById("shuffle-icon").onclick = () => {
      hush()
      window.speed && (window.speed = 1)
      this.sketches.clear()
      this.editor.clear()

      this.sketches.setRandomSketch()
      this.editor.setValue(this.sketches.code)
      this.engine.eval(this.editor.getValue())
    }

    document.getElementById("share-icon").onclick = () =>
      this.engine.eval(this.editor.getValue(), (code, error) => {
        console.log('evaluated', code, error)
        if (!error) showConfirmation(
          (name) => this.sketches.shareSketch(code, this.engine, name),
          () => this.hideConfirmation()
        )
      })

    document.getElementById("clear-icon").onclick = () => {
      hush()
      window.speed && (window.speed = 1)
      this.sketches.clear()
      this.editor.clear()
      //@todo: add clear/reset function to hydra
    }

    document.getElementById("pause-icon").onclick = () =>
      this.engine.pause()

	  document.getElementById("mutator-icon").onclick = ({shiftKey}) => {
      if (shiftKey) {
        this.editor.mutator.doUndo();
      } else {
        this.editor.mutator.mutate({reroll: false});
      }
    }

	  document.getElementById("record-icon").onclick = ({shiftKey}) => {
      this.engine.record()
    }

  }

}

module.exports = Menu

function showConfirmation (successCallback, terminateCallback) {
  const c = prompt(
    "Pressing OK will share this sketch to \n"+
    "https://twitter.com/hydra_patterns.\n\n"+
    "Include your name or twitter handle (optional):"
  )
  console.log('confirm value', c)
  if (c !== null) {
    successCallback(c)
  } else {
    terminateCallback()
  }
}

function formatCode (editor) {
  editor.setValue(
    require("prettier/standalone").format(
      editor.getValue(), {
      parser: "babel",
      plugins: [require("prettier/parser-babel")],
      printWidth: 50
    }))
}
