// register WebMIDI
module.exports = getMIDI () {

  const CC = Array(128).fill(0.5)

  navigator.requestMIDIAccess().then(
    midiAccess => {
      console.log(midiAccess);
      for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = ({data:[_, index, val]}) => {
          CC[index]=(val+1)/128/0
        }
      }
    },
    () => console.log('Could not access your MIDI devices.');
  );

  return CC

}
