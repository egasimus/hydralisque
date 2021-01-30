const prettier = require("prettier/standalone")
const parserBabel = require("prettier/parser-babel");

class Menu {
  constructor ({
    sketches,
    editor,
    engine
  }={}) {
    this.sketches = sketches
    this.editor   = editor
    this.engine   = engine

    // variables related to popup window
    this.closeButton   = document.getElementById("close-icon")
    this.clearButton   = document.getElementById("clear-icon")
    this.shareButton   = document.getElementById("share-icon")
    this.shuffleButton = document.getElementById("shuffle-icon")
    this.mutatorButton = document.getElementById("mutator-icon")
    this.runButton     = document.getElementById("run-icon")
    this.editorText    = document.getElementsByClassName('CodeMirror-scroll')[0]
    this.pauseButton   = document.getElementById("pause-icon")

    this.runButton.onclick = this.runAll.bind(this)
    this.shuffleButton.onclick = this.shuffleSketches.bind(this)
    this.shareButton.onclick = this.shareSketch.bind(this)
    this.clearButton.onclick = this.clearAll.bind(this)
    this.closeButton.onclick = () =>
      this.isClosed ? this.openModal : this.closeModal
    this.pauseButton.onclick = () => this.engine.pause()
	  this.mutatorButton.onclick = () => this.mutateSketch()
    this.isClosed = false
    this.closeModal()
  }

  runAll() {
    this.engine.eval(this.editor.getValue(), (string, err) => {
    //  console.log('eval', err)
     this.editor.flashCode()
      if(!err) this.sketches.saveLocally(this.editor.getValue())
    })
  }

  shuffleSketches() {
    this.clearAll()
    this.sketches.setRandomSketch()
    this.editor.setValue(this.sketches.code)
    this.engine.eval(this.editor.getValue())
  }

  formatCode() {
    this.editor.setValue(prettier.format(this.editor.getValue(), {
      parser: "babel",
      plugins: [parserBabel],
      printWidth: 50
    }))
  }

  shareSketch() {
    this.engine.eval(this.editor.getValue(), (code, error) => {
      console.log('evaluated', code, error)
      if(!error){
        this.showConfirmation( (name) => {
          this.sketches.shareSketch(code, this.engine, name)
        }, () => this.hideConfirmation() )
      }
    })
  }

  showConfirmation(successCallback, terminateCallback) {
    var c = prompt("Pressing OK will share this sketch to \nhttps://twitter.com/hydra_patterns.\n\nInclude your name or twitter handle (optional):")
    console.log('confirm value', c)
    if (c !== null) {
      successCallback(c)
    } else {
      terminateCallback()
    }
  }

  hideConfirmation() {

  }

  clearAll() {
    hush()
    window.speed && (window.speed = 1)
    this.sketches.clear()
    this.editor.clear()
    //@todo: add clear/reset function to hydra
  }

  closeModal () {
    document.getElementById("info-container").className = "hidden"
    this.closeButton.className = "fas fa-question-circle icon"
    for (let button of [
      this.shareButton,
      this.clearButton,
      this.mutatorButton,
      this.runButton
    ]) button.classList.remove('hidden')
    this.editorText.style.opacity = 1
    this.isClosed = true
  }

  openModal () {
    document.getElementById("info-container").className = ""
    this.closeButton.className = "fas fa-times icon"
    for (let button of [
      this.shareButton,
      this.clearButton,
      this.mutatorButton,
      this.runButton
    ]) button.classList.add('hidden')
    this.editorText.style.opacity = 0.0
    this.isClosed = false
  }

  mutateSketch(evt) {
  	if (evt.shiftKey) {
      this.editor.mutator.doUndo();
  	} else {
      this.editor.mutator.mutate({reroll: false});
    }
  }
}

module.exports = Menu
