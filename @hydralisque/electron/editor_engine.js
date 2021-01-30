const CHANNEL = 'hydra'
const {debug} = console
module.exports = (
  events
) => ({
  eval (code) {
    events.send(CHANNEL, { eval: code })
  },
  seek (t) {
    events.send(CHANNEL, { seek: t })
  },
  pause (state = 'toggle') {
    events.send(CHANNEL, { pause: state })
  },
  record (state = 'toggle') {
    events.send(CHANNEL, { record: state })
  },
})
