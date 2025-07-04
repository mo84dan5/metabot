export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.silentAudio = null;
    this.currentAudio = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.createSilentAudio();
    } catch (e) {
      console.error('Audio Context not supported:', e);
    }
  }

  createSilentAudio() {
    const arrayBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const audioSource = this.audioContext.createBufferSource();
    audioSource.buffer = arrayBuffer;
    audioSource.connect(this.audioContext.destination);
    
    this.silentAudio = audioSource;
  }

  async playSound(url) {
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.silentAudio) {
        this.silentAudio.start();
        this.silentAudio = null;
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();

      return source;
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  createPlayButton(audioBlob) {
    const blobUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(blobUrl);
    
    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    playButton.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    `;

    let isPlaying = false;
    
    playButton.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
        playButton.textContent = 'Play';
      } else {
        audio.play();
        playButton.textContent = 'Pause';
      }
      isPlaying = !isPlaying;
    });

    audio.addEventListener('ended', () => {
      isPlaying = false;
      playButton.textContent = 'Play';
    });

    document.body.appendChild(playButton);
    return { audio, playButton, blobUrl };
  }
}

export class AudioRecorder {
  constructor(stream) {
    this.stream = stream;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.source = null;
    this.processor = null;
    this.mp3encoder = null;
    this.mp3Data = [];
  }

  initializeRecorder() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.mp3encoder = new lamejs.Mp3Encoder(1, this.audioContext.sampleRate, 128);
    
    this.processor.onaudioprocess = (e) => {
      const samples = e.inputBuffer.getChannelData(0);
      const sampleBlockSize = 1152;
      
      for (let i = 0; i < samples.length; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = this.mp3encoder.encodeBuffer(this.convertFloat32ToInt16(sampleChunk));
        if (mp3buf.length > 0) {
          this.mp3Data.push(mp3buf);
        }
      }
    };
  }

  convertFloat32ToInt16(buffer) {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = Math.min(1, buffer[i]) * 0x7FFF;
    }
    return buf;
  }

  startRecording() {
    this.mp3Data = [];
    this.initializeRecorder();
    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    console.log('Recording started');
  }

  async stopRecording() {
    if (this.processor) {
      this.source.disconnect(this.processor);
      this.processor.disconnect(this.audioContext.destination);
    }

    const mp3buf = this.mp3encoder.flush();
    if (mp3buf.length > 0) {
      this.mp3Data.push(mp3buf);
    }

    const mp3Blob = new Blob(this.mp3Data, { type: 'audio/mpeg' });
    const arrayBuffer = await mp3Blob.arrayBuffer();
    const mp3Array = new Uint8Array(arrayBuffer);
    
    console.log('Recording stopped');
    return mp3Array;
  }
}