import { AudioManager } from './audioManager.js';

export class SoundPlayer extends AudioManager {
  constructor() {
    super();
    this.context = this.audioContext;

    // Play the silent sound immediately
    this.playSilent();
  }

  playSilent() {
    const silentBuffer = this.context.createBuffer(1, this.context.sampleRate * 5, this.context.sampleRate);
    const silentSource = this.context.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.loop = true;
    silentSource.connect(this.context.destination);
    silentSource.start();
  }

  async loadAndPlaySound(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);
    source.start(this.context.currentTime);

    // Replace the existing source with the new one
    this.source = source;
  }

  stopSound() {
    if (this.source) {
      this.source.loop = false;
      this.source.stop();
    }
  }
}