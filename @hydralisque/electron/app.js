#!/usr/bin/env electron
'use strict';
process.chdir(__dirname)
const {app, BrowserWindow, Menu} = require('electron')
const {is} = require('electron-util')

require('electron-unhandled')()
require('electron-debug')()

const windows = {
  viewer: undefined,
  editor: undefined
}

const createViewer = async () => {
  const win = new BrowserWindow({
    title:  app.name,
    show:   false,
    frame:  false,
    width:  512,
    height: 512,
    webPreferences: { nodeIntegration: true }
  })
  win.on('ready-to-show', () => win.show())
  win.on('closed', () => {windows.viewer = undefined})
  await win.loadFile(require('path').join(__dirname, 'viewer.html'))
  return win
}

const createEditor = async () => {
  const win = new BrowserWindow({
    title:  app.name,
    show:   false,
    frame:  false,
    width:  512,
    height: 512,
    webPreferences: { nodeIntegration: true }
  })
  win.on('ready-to-show', () => win.show())
  win.on('closed', () => {windows.editor = undefined})
  await win.loadFile(require('path').join(__dirname, 'editor.html'))
  return win
}

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) app.quit()
app.on('second-instance', () => {
  for (let window of Object.values(windows).filter(Boolean)) {
    if (window.isMinimized()) window.restore()
    window.show()
  }
})

app.on('window-all-closed', () => {
  if (!is.macos) app.quit()
})

const createWindows = async () => {
  windows.viewer = windows.viewer || await createViewer()
  windows.editor = windows.editor || await createEditor()
  const {ipcMain} = require('electron')
  ipcMain.on('eval', (event, code)=>{
    console.log('eval',code)
    windows.viewer.webContents.send('eval', code)
  })
  ipcMain.on('seek', (event, code)=>{
    console.log('seek',code)
    windows.viewer.webContents.send('seek', code)
  })
}

//app.on('activate', createWindows)

;(async () => {
  await app.whenReady()
  //Menu.setApplicationMenu(null)
  await createWindows()
})()
