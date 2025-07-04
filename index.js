import { config, getVersion } from './lib/config.js';
import { Modal, ApiKeyModal } from './lib/uiComponents.js';
import { AudioRecorder } from './lib/audioManager.js';
import { ARScene } from './lib/arScene.js';
import { ConversationManager } from './lib/conversationManager.js';
import { createMicButton } from './lib/createMicButton.js';
import { promptJapanese, promptEnglish } from './lib/prompts.js';
import { 
  isMobile, 
  requestDevicePermissions, 
  getWebcamStream, 
  loadGLTFModel,
  getUrlParams,
  getLanguage,
  getApiKey
} from './lib/utils.js';

console.log(getVersion());

class MetabotApp {
  constructor() {
    this.urlParams = getUrlParams();
    this.language = getLanguage(this.urlParams);
    this.prompt = this.language === 'ja' ? promptJapanese : promptEnglish;
    
    this.modals = {};
    this.apiKey = null;
    this.arScene = null;
    this.conversationManager = null;
    
    this.init();
  }

  init() {
    this.setupModals();
    this.setupApiKey();
    this.showInitialModal();
  }

  setupModals() {
    this.modals.main = new Modal({
      id: 'myModal',
      content: `${config.ui.modal.baseText}\n${getVersion()}`,
      showCloseButton: true,
      showOkButton: true,
      onOk: () => this.onMainModalOk()
    });
    this.modals.main.appendTo(document.body);

    this.modals.apiKey = new ApiKeyModal({
      onSubmit: (value) => {
        this.apiKey = value;
      }
    });
    this.modals.apiKey.appendTo(document.body);
  }

  setupApiKey() {
    const urlApiKey = getApiKey(this.urlParams);
    if (urlApiKey) {
      this.apiKey = urlApiKey;
      this.modals.apiKey.setValue(urlApiKey);
    } else {
      this.modals.apiKey.show();
    }
  }

  showInitialModal() {
    this.modals.main.show();
  }

  async onMainModalOk() {
    try {
      await this.startApp();
    } catch (error) {
      console.error('Error starting app:', error);
      this.modals.main.setContent(error.message);
      this.modals.main.show();
    }
  }

  async startApp() {
    console.log('Starting app...');
    
    const mobile = isMobile();
    let video = null;
    let webcamTexture = null;
    let recorder = null;

    if (mobile) {
      await requestDevicePermissions();
      video = await this.setupCamera();
      recorder = new AudioRecorder(video.srcObject);
    }

    const model = await loadGLTFModel(config.model.path);

    this.arScene = new ARScene({
      video: video,
      model: model,
      isMobile: mobile
    });

    const micButton = createMicButton();
    this.setupMicButtonPosition(micButton);

    this.conversationManager = new ConversationManager({
      apiKey: this.apiKey || this.modals.apiKey.getValue(),
      prompt: [...this.prompt],
      recorder: recorder,
      modal: this.modals.main,
      micButton: micButton
    });

    this.conversationManager.setupMicButtonHandlers();
    
    this.arScene.animate();
  }

  async setupCamera() {
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    
    const stream = await getWebcamStream(config.camera);
    video.srcObject = stream;
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
    
    return video;
  }

  setupMicButtonPosition(micButton) {
    const setPosition = () => {
      micButton.style.left = `calc(50% - ${micButton.offsetWidth / 2}px)`;
    };
    
    window.addEventListener('resize', setPosition);
    setPosition();
  }
}

const app = new MetabotApp();