// micButton.js
export function createMicButton() {
  const micButton = document.createElement('button')
  micButton.classList.add('mic-button')

  const micIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="20px" height="20px">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-2.41l-1.49-1.49C15.22 8.98 13.74 9 12 9s-3.22-.02-4.42-.9l-1.49 1.49C7.44 10.56 9.43 11 12 11s4.56-.44 5.91-1.41zM12 13c-2.33 0-7 1.17-7 3.5V18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  `
  micButton.innerHTML = micIcon

  const style = document.createElement('style')
  style.textContent = `
    .mic-button {
      position: absolute;
      width: 50px;
      height: 50px;
      background-color: white;
      border: none;
      border-radius: 50%;
      transition: transform 0.2s, background-color 0.2s;
      bottom: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .mic-button.pressed {
      transform: scale(1.5);
      background-color: red;
    }

    .mic-button.pressed svg {
      fill: white;
    }
  `

  document.head.appendChild(style)

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

  const setPosition = () => {
    micButton.style.left = `calc(50% - ${micButton.offsetWidth / 2}px)`
  }

  window.addEventListener('resize', setPosition)

  document.body.appendChild(micButton)
  setPosition()

  return micButton
}
