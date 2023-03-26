const _version = 'index.js: v1.0'
console.log(_version)

// モーダル要素を取得
const modal = document.getElementById('myModal')

// OKボタン要素を取得
const okButton = document.querySelector('.ok-button')

// 閉じるボタン要素を取得
const closeButton = document.querySelector('.close')

// ページ読み込み時にモーダルを表示

modal.style.display = 'block'

// OKボタンがクリックされたときの処理
okButton.onclick = function () {
  modal.style.display = 'none'
  main().catch((e) => console.error(e))
}

// 閉じるボタンがクリックされたときの処理
closeButton.onclick = function () {
  modal.style.display = 'none'
}

async function requestPermission() {
  // デバイスのジャイロセンサー(モーションと画面の向き)へのアクセス許可確認
  // iOS だけ DeviceMotionEvent も許可を得る必要がある
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    await DeviceOrientationEvent.requestPermission()
  }
}

async function getWebcamTexture(video) {
  const videoConstraints = {
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
  }
  // カメラ映像を video 要素に流す
  video.setAttribute('autoplay', '')
  video.setAttribute('playsinline', '')
  video.srcObject = await navigator.mediaDevices.getUserMedia(videoConstraints)
  await new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      video.play()
      resolve()
    }
  })
  // カメラ映像をThreeJSのテクスチャとして取得する
  const webcam_texture = new THREE.VideoTexture(video)
  webcam_texture.magFilter = THREE.LinearFilter
  webcam_texture.minFilter = THREE.LinearFilter
  webcam_texture.format = THREE.RGBFormat

  return webcam_texture
}

function main() {
  console.log('start app')
}
