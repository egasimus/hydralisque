#!/usr/bin/env electron
'use strict';
process.chdir(__dirname)

const windows = {
  viewer: undefined,
  editor: undefined
}

const {app, BrowserWindow, Menu} = require('electron')
const {is} = require('electron-util')
require('electron-unhandled')()
require('electron-debug')()

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) app.quit()

app.whenReady().then(createWindows)
function createWindows () {
  if (!windows.viewer) windows.viewer = require('./ViewerWindow')()
  windows.viewer.on('closed', () => {windows.viewer = undefined})

  if (!windows.editor) windows.editor = require('./EditorWindow')()
  windows.editor.on('closed', () => {windows.editor = undefined})
}

app.on('second-instance', () => {
  for (let window of Object.values(windows).filter(Boolean)) {
    if (window.isMinimized()) window.restore()
    window.show()
  }
})

app.on('window-all-closed', () => {
  if (!is.macos) app.quit()
})
