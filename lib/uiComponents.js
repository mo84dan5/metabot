export class UIButton {
  constructor(options = {}) {
    this.text = options.text || 'Button';
    this.className = options.className || '';
    this.styles = options.styles || {};
    this.onClick = options.onClick || (() => {});
    this.element = this.createElement();
  }

  createElement() {
    const button = document.createElement('button');
    button.textContent = this.text;
    
    if (this.className) {
      button.className = this.className;
    }

    Object.assign(button.style, this.getDefaultStyles(), this.styles);
    
    button.addEventListener('click', this.onClick);
    
    return button;
  }

  getDefaultStyles() {
    return {
      position: 'absolute',
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px'
    };
  }

  appendTo(parent) {
    parent.appendChild(this.element);
  }

  remove() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  setPosition(position) {
    Object.assign(this.element.style, position);
  }
}

export class MicButton extends UIButton {
  constructor(options = {}) {
    super({
      text: '',
      className: 'mic-button',
      ...options
    });
    
    this.setupMicIcon();
    this.setupStyles();
  }

  setupMicIcon() {
    this.element.innerHTML = '<i class="fas fa-microphone"></i>';
  }

  setupStyles() {
    Object.assign(this.element.style, {
      bottom: '60px',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#007BFF',
      fontSize: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.1s, box-shadow 0.1s'
    });
  }

  setPressed(pressed) {
    if (pressed) {
      this.element.classList.add('pressed');
      Object.assign(this.element.style, {
        transform: 'scale(0.95)',
        boxShadow: '0 2px 3px rgba(0, 0, 0, 0.2)'
      });
    } else {
      this.element.classList.remove('pressed');
      Object.assign(this.element.style, {
        transform: 'scale(1)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      });
    }
  }
}

export class Modal {
  constructor(options = {}) {
    this.id = options.id || 'modal';
    this.content = options.content || '';
    this.showCloseButton = options.showCloseButton !== false;
    this.showOkButton = options.showOkButton !== false;
    this.onOk = options.onOk || (() => {});
    this.onClose = options.onClose || (() => {});
    
    this.element = this.createElement();
  }

  createElement() {
    const modal = document.createElement('div');
    modal.id = this.id;
    modal.className = 'modal';
    modal.style.display = 'none';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    if (this.showCloseButton) {
      const closeButton = document.createElement('span');
      closeButton.className = 'close';
      closeButton.innerHTML = '&times;';
      closeButton.onclick = () => this.close();
      modalContent.appendChild(closeButton);
    }

    const contentElement = document.createElement('p');
    contentElement.id = `${this.id}-text`;
    contentElement.innerHTML = this.content;
    modalContent.appendChild(contentElement);

    if (this.showOkButton) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      const okButton = document.createElement('button');
      okButton.className = 'ok ok-button';
      okButton.textContent = 'OK';
      okButton.onclick = () => {
        this.onOk();
        this.close();
      };
      
      buttonContainer.appendChild(okButton);
      modalContent.appendChild(buttonContainer);
    }

    modal.appendChild(modalContent);
    return modal;
  }

  show() {
    this.element.style.display = 'block';
  }

  close() {
    this.element.style.display = 'none';
    this.onClose();
  }

  setContent(content) {
    const contentElement = this.element.querySelector(`#${this.id}-text`);
    if (contentElement) {
      contentElement.innerHTML = content;
    }
  }

  appendTo(parent) {
    parent.appendChild(this.element);
  }
}

export class ApiKeyModal extends Modal {
  constructor(options = {}) {
    super({
      id: 'apiModal',
      content: '会話機能を利用する際はOpenAIの API KEY を入力してください',
      showCloseButton: false,
      showOkButton: false,
      ...options
    });
    
    this.setupApiKeyInput();
  }

  setupApiKeyInput() {
    const contentElement = this.element.querySelector('.modal-content');
    
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.id = 'inputApiKey';
    this.input.style.fontSize = '16px';
    contentElement.appendChild(this.input);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    const submitButton = document.createElement('button');
    submitButton.className = 'submit ok-button';
    submitButton.textContent = 'Submit';
    submitButton.onclick = () => {
      if (this.onSubmit) {
        this.onSubmit(this.input.value);
      }
      this.close();
    };
    
    buttonContainer.appendChild(submitButton);
    contentElement.appendChild(buttonContainer);
  }

  getValue() {
    return this.input.value;
  }

  setValue(value) {
    this.input.value = value;
  }
}