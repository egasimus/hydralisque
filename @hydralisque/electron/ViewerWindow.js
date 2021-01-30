module.exports = ({

  IPCChannel = 'hydra',

  width  = 512,
  height = 512

}={}) => {

  const {BrowserWindow, ipcMain} = require('electron')

  const viewer = new BrowserWindow({
    width, height,
    title:  `Hydra Viewer`,
    show:   false,
    frame:  false,
    webPreferences: { nodeIntegration: true }
  })

  viewer.on('ready-to-show', () => viewer.show())

  viewer.loadFile(require('path').join(__dirname, 'viewer.html')).then(()=>{
    ipcMain.on(IPCChannel, (event, ...args)=>{
      console.debug(...args)
      viewer.webContents.send(IPCChannel, ...args)
    })
  })

  return viewer
}
