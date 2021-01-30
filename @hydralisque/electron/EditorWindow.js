module.exports = ({

  IPCChannel = 'hydra',

  width  = 512,
  height = 512

}={}) => {

  const {BrowserWindow} = require('electron')

  const editor = new BrowserWindow({
    width, height,
    title:  `Hydra Editor`,
    show:   false,
    frame:  false,
    webPreferences: { nodeIntegration: true }
  })

  editor.on('ready-to-show', () => editor.show())

  editor.loadFile(require('path').join(__dirname, 'editor.html'))

  return editor
}
