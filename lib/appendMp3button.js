function createPlayButton(mp3Blob) {
  const playButton = document.createElement('button')
  playButton.textContent = 'Play mp3'
  playButton.style.position = 'absolute'
  playButton.style.top = '10px'
  playButton.style.left = '10px'

  const audioElement = document.createElement('audio')
  audioElement.src = URL.createObjectURL(mp3Blob)
  audioElement.style.display = 'none'

  playButton.addEventListener('click', () => {
    if (audioElement.paused) {
      audioElement.play()
      playButton.textContent = 'Pause mp3'
    } else {
      audioElement.pause()
      playButton.textContent = 'Play mp3'
    }
  })

  document.body.appendChild(playButton)
  document.body.appendChild(audioElement)
}
