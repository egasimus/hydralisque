module.exports = function initScreenshot (self) {
  // boolean to store when to save screenshot
  self.saveFrame = false
  self.synth.screencap = () => { self.saveFrame = true }
}

