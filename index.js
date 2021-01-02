#!/usr/bin/env electron

'use strict';

const {app, BrowserWindow, Menu} = require('electron')
const {is} = require('electron-util')
const unhandled = require('electron-unhandled')
const debug = require('electron-debug')
const contextMenu = require('electron-context-menu')

const config = require('./config')
const menu = require('./menu')

unhandled()
debug()
contextMenu()

// Prevent window from being garbage collected
let mainWindow
const createMainWindow = async () => {
  const win = new BrowserWindow({
    title:  app.name,
    show:   false,
    frame:  false,
    width:  512,
    height: 512,
    webPreferences: { nodeIntegration: true }
  })
  win.on('ready-to-show', () => win.show())
  win.on('closed', () => {
    // Dereference the window
    // For multiple windows store them in an array
    mainWindow = undefined
  })
  await win.loadFile(require('path').join(__dirname, 'app/index.html'))
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

app.on('activate', async () => {
  if (!mainWindow) mainWindow = await createMainWindow()
})

;(async () => {
  await app.whenReady()
  Menu.setApplicationMenu(menu)
  mainWindow = await createMainWindow()
})()
