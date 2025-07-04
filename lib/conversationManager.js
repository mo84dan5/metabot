import { AudioRecorder } from './audioManager.js';
import { SoundPlayer } from './soundPlayer.js';
import { transcribeAudio } from './transcribeAudio.js';
import { chatCompletions } from './chatCompletions.js';
import { textToSpeech } from './textToSpeech.js';

export class ConversationManager {
  constructor(options = {}) {
    this.apiKey = options.apiKey;
    this.prompt = options.prompt || [];
    this.recorder = options.recorder;
    this.soundPlayer = new SoundPlayer();
    this.modal = options.modal;
    this.micButton = options.micButton;
    
    this.state = 'wait';
    this.allowRecordEnd = false;
    this.timeoutId = null;
  }

  setState(newState) {
    console.log(`State change: ${this.state} -> ${newState}`);
    this.state = newState;
  }

  async startRecording() {
    console.log('レコーディング開始');
    this.recorder.startRecording();
    this.setState('recording');
  }

  async stopRecording() {
    console.log('レコーディング終了');
    this.setState('processing');
    
    this.micButton.style.display = 'none';
    
    const mp3Data = await this.recorder.stopRecording();
    const mp3Blob = new Blob([mp3Data], { type: 'audio/mpeg' });
    
    return mp3Blob;
  }

  async processTranscription(mp3Blob) {
    const whisperMessage = await transcribeAudio(mp3Blob, this.apiKey);
    console.log('Transcription:', whisperMessage);
    
    if (this.modal) {
      this.modal.setContent('YOU: ' + whisperMessage.text);
      this.modal.show();
    }
    
    return whisperMessage;
  }

  async getChatResponse(userMessage) {
    this.prompt.push({
      role: 'user',
      content: userMessage
    });
    
    const chatResponse = await chatCompletions(this.prompt, this.apiKey);
    console.log('Chat response:', chatResponse);
    
    if (chatResponse && chatResponse.choices && chatResponse.choices[0]) {
      this.prompt.push(chatResponse.choices[0].message);
      return chatResponse.choices[0].message;
    }
    
    return null;
  }

  async playResponse(message) {
    if (this.modal) {
      this.modal.setContent('METABOT: ' + message.content);
      this.modal.show();
    }
    
    try {
      const mp3Url = await textToSpeech(this.apiKey, message.content, 'onyx');
      if (mp3Url) {
        await this.soundPlayer.loadAndPlaySound(mp3Url);
      }
    } catch (error) {
      console.error('Failed to play response:', error);
    }
    
    this.micButton.style.display = 'block';
    this.setState('wait');
  }

  async handleStateAction() {
    switch (this.state) {
      case 'wait':
        await this.startRecording();
        break;
        
      case 'recording':
        const mp3Blob = await this.stopRecording();
        const whisperMessage = await this.processTranscription(mp3Blob);
        
        if (whisperMessage && whisperMessage.text) {
          const chatMessage = await this.getChatResponse(whisperMessage.text);
          if (chatMessage) {
            await this.playResponse(chatMessage);
          }
        }
        break;
        
      default:
        console.log('未定義の状態です');
        break;
    }
  }

  setupMicButtonHandlers() {
    this.micButton.addEventListener('mousedown', () => {
      if (this.state === 'wait') {
        this.micButton.classList.add('pressed');
        this.handleStateAction();
        
        this.timeoutId = setTimeout(async () => {
          if (this.state === 'recording') {
            this.micButton.classList.remove('pressed');
            await this.handleStateAction();
            this.allowRecordEnd = false;
          }
        }, 5000);
        
        setTimeout(() => {
          this.allowRecordEnd = true;
        }, 1000);
      }
    });

    this.micButton.addEventListener('mouseup', async () => {
      if (!this.allowRecordEnd) {
        return;
      }
      
      clearTimeout(this.timeoutId);
      
      if (this.state === 'recording') {
        this.micButton.classList.remove('pressed');
        await this.handleStateAction();
      }
      
      this.allowRecordEnd = false;
    });
  }
}