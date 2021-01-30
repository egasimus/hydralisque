const {info} = console

module.exports = function initCanvas (self, canvas) {
  info('initCanvas', ...arguments)
  // create main output canvas and add to screen
  if (canvas) {
    self.canvas = canvas
    self.width = canvas.width
    self.height = canvas.height
  } else {
    self.canvas = document.createElement('canvas')
    self.canvas.width = self.width
    self.canvas.height = self.height
    self.canvas.style.width = '100%'
    self.canvas.style.height = '100%'
    self.canvas.style.imageRendering = 'pixelated'
    document.body.appendChild(self.canvas)
  }
}
