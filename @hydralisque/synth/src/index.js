class HydraRenderer {
  // TODO: add ability to pass in certain uniforms and transforms

  constructor ({
    patchbay = null,
    width = 1280,
    height = 720,
    numSources = 4,
    numOutputs = 4,
    makeGlobal = true,
    autoLoop = true,
    detectAudio = true,
    enableStreamCapture = true,
    canvas,
    precision = 'mediump',
    extendTransforms = {} // add your own functions on init
  } = {}) {

    require('./ArrayUtils').init()

    // only allow valid precision options
    let precisionOptions = ['lowp','mediump','highp']
    let precisionValid = precisionOptions.includes(precision.toLowerCase())
    if(!precisionValid) console.warn(
      '[hydra-synth warning]\n'+
      'Constructor was provided an invalid floating point precision value of "'
      + precision + '". Using default value of "mediump" instead.')

    Object.assign(this, {
      pb: patchbay,
      width,
      height,
      renderAll: false,
      detectAudio,
      synth: {
        // object that contains all properties that will be made available
        // on the global context and during local evaluation
        time:   0,
        bpm:    30,
        width,
        height,
        fps:    undefined,
        stats:  { fps: 0 },
        speed:  1,
        mouse:  require('mouse-change')(),
        render: this._render.bind(this),
        setResolution: this.setResolution.bind(this),
        update: (dt) => {},// user defined update function
        hush:   this.hush.bind(this)
      },
      timeSinceLastUpdate: 0,
      _time: 0, // for internal use, only to use for deciding when to render frames
      precision: precisionValid ? precision.toLowerCase() : 'mediump',
      extendTransforms
    })

    require('./Canvas')(this, canvas)

    require('./RootShaders')(this)

    require('./Output')(this, numOutputs)

    require('./Source')(this, numSources)

    require('./GeneratorFactory')(this)

    require('./Screenshot')(this)

    require('./VideoRecorder')(this, enableStreamCapture)

    this.generator = undefined

    if (detectAudio) require('./Audio')(this)

    if (autoLoop) (require('raf-loop'))(this.tick.bind(this)).start()
    
    this.sandbox = require('./EvalSandbox')(
      this.synth,
      makeGlobal,
      // properties that the user can set:
      // (all others are treated as read-only)
      ['speed', 'update', 'bpm', 'fps']
    )
  }

  eval (code) {
    console.log('hydra.eval', code)
    this.sandbox.eval(code)
  }

  seek (time) {
    this.sandbox.set('time', time)
  }

  getScreenImage (callback) {
    this.imageCallback = callback
    this.saveFrame = true
  }

  hush () {
    this.s.forEach((source) => { source.clear() })
    this.o.forEach((output) => { this.synth.solid(1, 1, 1, 0).out(output) })
  }

  setResolution (width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.width = width
    this.height = height
    this.o.forEach((output) => {
      output.resize(width, height)
    })
    this.s.forEach((source) => {
      source.resize(width, height)
    })
    this.regl._refresh()
     console.log(this.canvas.width)
  }

  canvasToImage (callback) {
    const a = document.createElement('a')
    a.style.display = 'none'
    let d = new Date()
    a.download = `hydra-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${d.getHours()}.${d.getMinutes()}.${d.getSeconds()}.png`
    document.body.appendChild(a)
    var self = this
    this.canvas.toBlob(blob => {
      if(self.imageCallback){
        self.imageCallback(blob)
        delete self.imageCallback
      } else {
        a.href = URL.createObjectURL(blob)
        console.log(a.href)
        a.click()
      }
    }, 'image/png')
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    }, 300);
  }

  _render (output) {
    if (output) {
      this.output = output
      this.isRenderingAll = false
    } else {
      this.isRenderingAll = true
    }
  }

  // dt in ms
  tick (dt, uniforms) {
    this.sandbox.tick()
    if(this.detectAudio === true) this.synth.a.tick()
  //  let updateInterval = 1000/this.synth.fps // ms
    if(this.synth.update) {
      try { this.synth.update(dt) } catch (e) { console.log(error) }
    }

    this.sandbox.set('time', this.synth.time += dt * 0.001 * this.synth.speed)
    this.timeSinceLastUpdate += dt
    if(!this.synth.fps || this.timeSinceLastUpdate >= 1000/this.synth.fps) {
    //  console.log(1000/this.timeSinceLastUpdate)
      this.synth.stats.fps = Math.ceil(1000/this.timeSinceLastUpdate)
    //  console.log(this.synth.speed, this.synth.time)
      for (let i = 0; i < this.s.length; i++) {
        this.s[i].tick(this.synth.time)
      }
    //  console.log(this.canvas.width, this.canvas.height)
      for (let i = 0; i < this.o.length; i++) {
        this.o[i].tick({
          time: this.synth.time,
          mouse: this.synth.mouse,
          bpm: this.synth.bpm,
          resolution: [this.canvas.width, this.canvas.height]
        })
      }
      if (this.isRenderingAll) {
        this.renderAll({
          tex0: this.o[0].getCurrent(),
          tex1: this.o[1].getCurrent(),
          tex2: this.o[2].getCurrent(),
          tex3: this.o[3].getCurrent(),
          resolution: [this.canvas.width, this.canvas.height]
        })
      } else {

        this.renderFbo({
          tex0: this.output.getCurrent(),
          resolution: [this.canvas.width, this.canvas.height]
        })
      }
      this.timeSinceLastUpdate = 0
    }
    if(this.saveFrame === true) {
      this.canvasToImage()
      this.saveFrame = false
    }
  //  this.regl.poll()
  }

}

module.exports = HydraRenderer
