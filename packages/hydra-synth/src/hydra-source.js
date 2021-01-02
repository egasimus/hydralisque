const Webcam = require('./webcam.js')
const Screen = require('./../lib/screenmedia.js')

class HydraSource  {

  constructor (opts) {
    this.regl = opts.regl
    this.src = null
    this.dynamic = true
    this.width = opts.width
    this.height = opts.height
    this.tex = this.regl.texture({
      shape: [opts.width, opts.height]
    })
    this.pb = opts.pb
  }

  init (opts) {
    if (opts.src) {
      this.src = opts.src
      this.tex = this.regl.texture(this.src)
    }
    if(opts.dynamic) this.dynamic = opts.dynamic
  }

  initCam (index) {
    const self = this
    Webcam(index).then((response) => {
      self.src = response.video
      self.tex = self.regl.texture(self.src)
    })
  }

  initStream (streamName) {
    console.log("initing stream!", streamName)
    let self = this
    if (streamName && this.pb) {
        this.pb.initSource(streamName, function(stream){
          console.log("GOT STREAM", stream)
          const video = document.createElement('video')
          //  video.src = URL.createObjectURL(localStream)
          video.srcObject = stream
          video.addEventListener('loadedmetadata', () => {
            self.video = video
            self.tex = self.regl.texture(self.video)
            self.src = self.video
          })
        })
      //  console.log("STREAM", opts.stream)

    }
  }

  initScreen () {
    const self = this
    Screen().then(function (response) {
       self.src = response.video
       self.tex = self.regl.texture(self.src)
     //  console.log("received screen input")
     })
  }

  clear () {
    this.src = null
    this.tex = this.regl.texture({
      shape: [this.width, this.height]
    })
  }

  tick (time) {
  //  console.log("src", src)
    if (this.src !== null && this.dynamic === true) {
        this.tex.subimage(this.src)
    }
  }

  getTexture () {
    return this.tex
  }
}

module.exports = HydraSource
