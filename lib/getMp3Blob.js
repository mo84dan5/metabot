export default class AudioVideoRecorder {
  constructor(stream) {
    this.stream = stream
    this.mediaRecorder = null
    this.chunks = []
    this.audioContext = new AudioContext()
  }

  startRecording() {
    this.chunks = []
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm',
    })
    this.mediaRecorder.start()

    this.mediaRecorder.ondataavailable = (event) => {
      this.chunks.push(event.data)
    }
  }

  async stopRecording() {
    return new Promise(async (resolve) => {
      this.mediaRecorder.onstop = async () => {
        const audioBuffer = await this.processAudioBuffer(this.chunks)
        const wavData = this.audioBufferToWav(audioBuffer)
        const mp3Data = this.wavToMp3(wavData)
        resolve(mp3Data)
      }

      this.mediaRecorder.stop()
    })
  }

  async processAudioBuffer(chunks) {
    const blob = new Blob(chunks, { type: 'audio/webm' })
    const arrayBuffer = await blob.arrayBuffer()
    return await this.audioContext.decodeAudioData(arrayBuffer)
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
