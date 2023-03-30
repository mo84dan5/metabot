export class AudioRecorder {
  constructor(stream) {
    this.stream = stream
    this.mediaRecorder = null
    this.chunks = []
    this.audioContext = new AudioContext()
    this.source = this.audioContext.createMediaStreamSource(stream)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)
    this.source.connect(this.processor)
    this.processor.connect(this.audioContext.destination)
  }

  startRecording() {
    this.chunks = []
    this.processor.onaudioprocess = (event) => {
      const channelData = event.inputBuffer.getChannelData(0)
      this.chunks.push(new Float32Array(channelData))
    }
  }

  stopRecording() {
    this.processor.onaudioprocess = null

    const audioBuffer = this.audioContext.createBuffer(
      1,
      this.chunks.reduce((acc, chunk) => acc + chunk.length, 0),
      this.audioContext.sampleRate
    )

    const channelData = audioBuffer.getChannelData(0)
    let offset = 0
    for (let chunk of this.chunks) {
      channelData.set(chunk, offset)
      offset += chunk.length
    }

    const wavData = this.audioBufferToWav(audioBuffer)
    const mp3Data = this.wavToMp3(wavData)

    return mp3Data
  }

  audioBufferToWav(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels
    const length = audioBuffer.length * numberOfChannels * 2
    const buffer = new ArrayBuffer(length)
    const data = new DataView(buffer)

    let offset = 0
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i]
        const maxSample = Math.max(-1, Math.min(1, sample))
        data.setInt16(
          offset,
          maxSample < 0 ? maxSample * 0x8000 : maxSample * 0x7fff,
          true
        )
        offset += 2
      }
    }

    return new Int16Array(buffer)
  }

  wavToMp3(wavData) {
    const mp3Encoder = new lamejs.Mp3Encoder(1, 44100, 128)
    const mp3Data = mp3Encoder.encodeBuffer(wavData)
    return mp3Data
  }
}
