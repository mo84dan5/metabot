export const config = {
  version: 'v1.63 ※音量注意',
  
  api: {
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      models: {
        chat: 'gpt-4o',
        transcription: 'whisper-1',
        tts: 'tts-1'
      }
    }
  },
  
  camera: {
    video: {
      width: {
        min: 1280,
        ideal: 1920,
        max: 2560,
      },
      height: {
        min: 720,
        ideal: 1080,
        max: 1440,
      },
      facingMode: 'environment',
    },
    audio: true
  },
  
  ui: {
    modal: {
      baseText: 'このアプリケーションはカメラと音声、動作と方向等へのアクセス許可が必要です。'
    },
    micButton: {
      recordingTimeout: 5000,
      recordingDelay: 1000
    }
  },
  
  model: {
    path: './assets/sample3.glb',
    scale: 3
  }
};

export function getConfig() {
  return config;
}

export function getVersion() {
  return `version: ${config.version}`;
}