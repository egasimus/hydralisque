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

    require('./lib/ArrayUtils').init()

    this.pb          = patchbay
    this.width       = width
    this.height      = height
    this.renderAll   = false
    this.detectAudio = detectAudio

    initCanvas(this, canvas)

    this.synth = {
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
    }

    this.timeSinceLastUpdate = 0
    this._time = 0 // for internal use, only to use for deciding when to render frames

    // only allow valid precision options
    let precisionOptions = ['lowp','mediump','highp']
    let precisionValid = precisionOptions.includes(precision.toLowerCase())
    this.precision = precisionValid ? precision.toLowerCase() : 'mediump'
    if(!precisionValid) console.warn(
      '[hydra-synth warning]\n'+
      'Constructor was provided an invalid floating point precision value of "'
      + precision + '". Using default value of "mediump" instead.')

    this.extendTransforms = extendTransforms

    initRegl(this)

    initOutputs(this, numOutputs)

    initSources(this, numSources)

    generateGlslTransforms(this)

    initScreenshot(this)

    initRecorder(this, enableStreamCapture)

    this.generator = undefined

    if (detectAudio) initAudio(this)

    if (autoLoop) (require('raf-loop'))(this.tick.bind(this)).start()
    
    this.sandbox = new (require('./EvalSandbox.js'))(
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

  createSource (i) {
    let s = new (require('./HydraSource'))({
      regl:   this.regl,
      pb:     this.pb,
      width:  this.width,
      height: this.height,
      label:  `s${i}`
    })
    this.synth['s' + this.s.length] = s
    this.s.push(s)
    return s
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

function initRegl (self) {

  const RootShaders = require('./glsl/RootShaders')

  const regl = self.regl = require('regl')({
  //  profile: true,
    canvas: self.canvas,
    pixelRatio: 1//,
    // extensions: [
    //   'oes_texture_half_float',
    //   'oes_texture_half_float_linear'
    // ],
    // optionalExtensions: [
    //   'oes_texture_float',
    //   'oes_texture_float_linear'
   //]
  })

  // clear color buffer to black and depth buffer to 1
  regl.clear({  color: [0, 0, 0, 1] })

  Object.assign(self, {

    renderAll: regl({
      frag: RootShaders.ALL_FRAG(self.precision),
      vert: RootShaders.ALL_VERT(self.precision),
      attributes: { position: [ [-2, 0], [0, -2], [2, 2] ] },
      uniforms: {
        tex0: regl.prop('tex0'),
        tex1: regl.prop('tex1'),
        tex2: regl.prop('tex2'),
        tex3: regl.prop('tex3')
      },
      count: 3,
      depth: { enable: false }
    }),

    renderFbo: regl({
      frag: RootShaders.FBO_FRAG(self.precision),
      vert: RootShaders.FBO_VERT(self.precision),
      attributes: { position: [ [-2, 0], [0, -2], [2, 2] ] },
      uniforms: {
        tex0: regl.prop('tex0'),
        resolution: regl.prop('resolution')
      },
      count: 3,
      depth: { enable: false }
    })

  })
}

function initOutputs (self, numOutputs) {
  self.o = (Array(numOutputs)).fill().map((el, index) => {
    const options = {
      regl:      self.regl,
      width:     self.width,
      height:    self.height,
      precision: self.precision,
      label:     `o${index}`
    }
    const o = new (require('./Output'))(options)
  //  o.render()
    o.id = index
    self.synth['o'+index] = o
    return o
  })

  // set default output
  self.output = self.o[0]
}

function initSources (self, numSources) {
  self.s = []
  for(var i = 0; i < numSources; i++) {
    self.createSource(i)
  }
}

function generateGlslTransforms (self) {
  self.generator = new (require('./GeneratorFactory.js'))({
    defaultOutput: self.o[0],
    defaultUniforms: self.o[0].uniforms,
    extendTransforms: self.extendTransforms,
    changeListener: ({type, method, synth}) => {
        if (type === 'add') {
          self.synth[method] = synth.generators[method]
          if(self.sandbox) self.sandbox.add(method)
        } else if (type === 'remove') {
          // what to do here? dangerously deleting window methods
          //delete window[method]
        }
    //  }
    }
  })
  self.synth.setFunction = self.generator.setFunction.bind(self.generator)
}

function initScreenshot (self) {
  // boolean to store when to save screenshot
  self.saveFrame = false
  self.synth.screencap = () => { self.saveFrame = true }
}

function initRecorder (self, enableStreamCapture) {
  // if stream capture is enabled, self object contains the capture stream
  self.captureStream = null
  if (enableStreamCapture) {
    self.captureStream = self.canvas.captureStream(25)
    // to do: enable capture stream of specific sources and outputs
    self.synth.vidRecorder = new (require('./lib/VideoRecorder.js'))(
      self.captureStream
    )
  }
}

function initCanvas (self, canvas) {
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

function initAudio (self, numBins = 4) {
  self.synth.a = new (require('./lib/Audio'))({
    numBins,
    // changeListener: ({audio}) => {
    //   that.a = audio.bins.map((_, index) =>
    //     (scale = 1, offset = 0) => () => (audio.fft[index] * scale + offset)
    //   )
    //
    //   if (that.makeGlobal) {
    //     that.a.forEach((a, index) => {
    //       const aname = `a${index}`
    //       window[aname] = a
    //     })
    //   }
    // }
  })
}
