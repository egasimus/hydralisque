// handles code evaluation and attaching relevant objects to global and evaluation contexts
const {info} = console

module.exports = function initEvalSandbox (synth, makeGlobal, userProps) {
  info('initEvalSandbox', ...arguments)
  return new EvalSandbox(synth, makeGlobal, userProps)
}

const ArrayUtils = require('./ArrayUtils')

class EvalSandbox {
  constructor(parent, makeGlobal, userProps = []) {
    this.makeGlobal = makeGlobal
    this.sandbox = require('./Sandbox')(parent)
    this.parent = parent
    var properties = Object.keys(parent)
    properties.forEach((property) => this.add(property))
    this.userProps = userProps
  }

  add(name) {
    if(this.makeGlobal) window[name] = this.parent[name]
    this.sandbox.addToContext(name, `parent.${name}`)
  }

// sets on window as well as synth object if global (not needed for objects, which can be set directly)

  set(property, value) {
    if(this.makeGlobal) {
      window[property] = value
    }
    this.parent[property] = value
  }

  tick() {
    if(this.makeGlobal) {
      this.userProps.forEach((property) => {
        this.parent[property] = window[property]
      })
      //  this.parent.speed = window.speed
    } else {

    }
  }

  eval(code) {
    this.sandbox.eval(code)
  }
}
