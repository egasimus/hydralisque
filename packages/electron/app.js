#!/usr/bin/env electron

'use strict';

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
  await win.loadFile(require('path').join(__dirname, 'app/viewer.html'))
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
  win.on('closed', () => {windows.viewer = undefined})
  await win.loadFile(require('path').join(__dirname, 'app/editor.html'))
  return win
}

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) app.quit()
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
  }
})

app.on('window-all-closed', () => {
  if (!is.macos) app.quit()
})

const createWindows = async () => {
  windows.viewer = windows.viewer || await createViewer()
  windows.editor = windows.editor || await createEditor()
}

app.on('activate', createWindows)

;(async () => {
  await app.whenReady()
  Menu.setApplicationMenu(null)
  await createWindows()
})()

