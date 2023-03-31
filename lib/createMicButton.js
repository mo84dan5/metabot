// MicButton.js
export function createMicButton() {
  // Create button and apply styles
  const micButton = document.createElement('button')
  micButton.classList.add('mic-button')
  applyStyles(micButton)

  // Event listeners
  let pressTimer
  micButton.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      micButton.classList.add('pressed')
    }, 500)
  })

  micButton.addEventListener('mouseup', () => {
    clearTimeout(pressTimer)
    micButton.classList.remove('pressed')
  })

  micButton.addEventListener('mouseleave', () => {
    clearTimeout(pressTimer)
    micButton.classList.remove('pressed')
  })

  return micButton
}

const applyStyles = (micButton) => {
  const style = document.createElement('style')
  style.innerHTML = `
    .mic-button {
      position: absolute;
      width: 50px;
      height: 50px;
      background-color: transparent;
      border: none;
      border-radius: 50%;
      bottom: 20px;
      left: calc(50% - 25px);
      transition: transform 0.2s;
    }

    .mic-button::before,
    .mic-button::after {
      content: "";
      position: absolute;
    }

    .mic-button::before {
      width: 10px;
      height: 30px;
      background-color: #000;
      top: -30px;
      left: 20px;
    }

    .mic-button::after {
      width: 30px;
      height: 10px;
      background-color: #000;
      top: -40px;
      left: 10px;
      border-radius: 0 0 15px 15px;
    }

    .mic-button.pressed {
      transform: scale(1.5);
    }

    .mic-button.pressed::before,
    .mic-button.pressed::after {
      background-color: red;
    }
  `
  document.head.appendChild(style)
  document.body.appendChild(micButton)
}
