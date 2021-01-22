module.exports = function initMIDI (cb=()=>{}) {
  const cc = Array(128).fill(0.5)
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
  return cc

  function onMIDISuccess ({inputs, outputs}) {
    for (var input of inputs.values()) {
      input.onmidimessage = getMIDIMessage;
    }
    function getMIDIMessage ({data:[channel, index, value]}) {
      value = ((value+1)/128.0 - 0.5)*2.0 // normalize to [-1;1]
      console.log('Midi received on cc#' + index + ' value:' + value)  // uncomment to monitor incoming Midi
      cc[index] = value
      cb(index, value)
    }
  }

  function onMIDIFailure() {
    alert('Could not access your MIDI devices.');
  }
}
