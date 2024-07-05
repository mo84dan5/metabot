export class SoundPlayer {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();

    // 無音バッファの作成
    const silentBuffer = this.context.createBuffer(1, this.context.sampleRate * 5, this.context.sampleRate);

    // 音源（BufferSource）を作成し、バッファに無音データを指定します
    this.source = this.context.createBufferSource();
    this.source.buffer = silentBuffer;

    // 無音の再生をループさせます
    this.source.loop = true;

    // 音源を出力（destination）に接続します
    this.source.connect(this.context.destination);

    // 無音の再生を開始します
    this.source.start(0);
  }

  async loadAndPlaySound(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.source.buffer = audioBuffer;  // 新しい音声データで無音を上書きします
    this.source.start(this.context.currentTime); // 接続済みの音源の再生をすぐに開始します
  }

  stopSound() {
    if (this.source) {
      this.source.loop = false;  // ループを停止します
      this.source.stop();  // 音声の再生を停止します
    }
  }
}
//
// let player = new SoundPlayer();  // インスタンスを作成し、無音を再生開始します
//
// player.loadAndPlaySound("https://example.com/path/to/sound/file.mp3"); // 音声ファイルを読み込み、無音の後に再生します
//
// // 音声（または無音）の再生を停止するときは以下を呼び出します
// player.stopSound();