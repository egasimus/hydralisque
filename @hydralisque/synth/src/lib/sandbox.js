// attempt custom evaluation sandbox for hydra functions
// for now, just avoids polluting the global namespace
// should probably be replaced with an abstract syntax tree

module.exports = (parent) => {
  let initial = ``
  let sandbox = createSandbox(initial)
  return {
    addToContext (name, object) {
      initial += `;var ${name} = ${object};`
      sandbox = createSandbox(initial)
    },
    eval (code) { sandbox.eval(code) }
  }
}

function createSandbox (initial) {
  eval(initial)

  // optional params
  var localEval = function (code)  {
  }

  // API/data for end-user
  return {
    eval: function localEval (code) {
      console.debug('localEval', code)
      eval(code)
    }
  }
}
