const _version = 'index.js: v1.36'
console.log(_version)

import { waitAndReturn } from './lib/waitFunction.js'
import { AudioRecorder } from './lib/getMp3Blob.js'
import { createPlayButton } from './lib/appendMp3button.js'
import { transcribeAudio } from './lib/transcribeAudio.js'
import { chatCompletions } from './lib/chatCompletions.js'
import { createMicButton } from './lib/createMicButton.js'

// モーダル要素を取得
const modal = document.getElementById('myModal')

// OKボタン要素を取得
const okButton = document.querySelector('.ok')

// モーダル要素を取得
const apiKeyModal = document.getElementById('apiModal')

// submitボタン要素を取得
const apiKeySubmitButton = document.querySelector('.submit')

const inputApiKey = document.getElementById('inputApiKey')

// 閉じるボタン要素を取得
const closeButton = document.querySelector('.close')

const modalTextElement = document.getElementById('modal-text')
const baseText =
  'このアプリケーションはカメラと音声、動作と方向等へのアクセス許可が必要です。'
modalTextElement.innerHTML = baseText + '\n' + _version

// ページ読み込み時にモーダルを表示

modal.style.display = 'block'

// OKボタンがクリックされたときの処理
let okButtonOnce = true
okButton.onclick = function () {
  modal.style.display = 'none'
  if (okButtonOnce) {
    okButtonOnce = false
    main().catch((e) => {
      console.log(e)
      modalTextElement.innerHTML = e
      modal.style.display = 'block'
    })
  } else {
    modal.style.display = 'none'
  }
}

// OKボタンがクリックされたときの処理
apiKeySubmitButton.onclick = function () {
  apiKeyModal.style.display = 'none'
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
    audio: true,
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

// プロミスを返すGLTFLoader関数
function loadGLTFModel(url) {
  // GLTFLoaderオブジェクトを作成
  const loader = new THREE.GLTFLoader()

  // Promiseを使用してモデルを読み込む
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf), // ロード成功時の処理
      undefined, // 進捗イベント用のコールバックは使用しない
      (error) => reject(error) // ロード失敗時の処理
    )
  })
}

const isMobile = () => {
  // ユーザーエージェントを取得
  var userAgent = navigator.userAgent || navigator.vendor || window.opera

  // モバイルデバイスかどうかを判定
  var isMobile = /Mobi|Android/i.test(userAgent)

  if (isMobile) {
    // モバイルデバイスからアクセスしている場合の処理
    return true
  } else {
    // PCからアクセスしている場合の処理
    return false
  }
}

const main = async () => {
  console.log('start app')
  // カメラ映像を投影するテクスチャを作成
  let video
  let webcamTexture
  let recorder
  if (isMobile()) {
    await requestPermission()
    video = document.createElement('video')
    video.muted = true
    webcamTexture = await getWebcamTexture(video)
    recorder = new AudioRecorder(video.srcObject)
  }

  const contentsPromises = []
  const modelPromise = loadGLTFModel('./assets/sample3.glb')
  contentsPromises.push(modelPromise)
  Promise.all(contentsPromises)
  const model = await modelPromise

  // alias
  const [w, h] = [window.innerWidth, window.innerHeight]

  // ThreeJSのシーンを作成
  const scene = new THREE.Scene()
  if (webcamTexture) {
    // シーンの背景にカメラの動画テクスチャを貼り付ける
    scene.background = webcamTexture
  }
  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
  camera.position.set(0, 3, 2)
  scene.add(camera)
  const light = new THREE.HemisphereLight()
  scene.add(light)

  //  ThreeJSのレンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true,
    antialias: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(w, h)
  // レンダラーのdomElementにスタイルを適用
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = 0
  renderer.domElement.style.left = 0

  // <body>にスタイルを適用
  document.body.style.margin = 0
  document.body.style.overflow = 'hidden'

  window.addEventListener('resize', () => {
    // ウィンドウサイズが変更されたときにレンダラーのサイズを更新
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })

  // カメラのコントロールをジャイロセンターから取得した値と連携: THREE.DeviceOrientationControls
  let controls
  if (isMobile()) {
    controls = new THREE.DeviceOrientationControls(camera, true)
    controls.connect()
  } else {
    controls = new THREE.OrbitControls(camera, renderer.domElement)
  }

  document.body.appendChild(renderer.domElement)

  // gltfモデルをsceneに追加
  console.log(model)
  model.scene.scale.set(3, 3, 3)
  model.scene.traverse((object) => {
    object.frustumCulled = false
  })
  const mixer = new THREE.AnimationMixer(model.scene)
  const action = mixer.clipAction(model.animations[0])
  action.play()
  scene.add(model.scene)

  const pointLight = new THREE.PointLight(0xffffff, 1, 10)
  pointLight.position.set(0, 3, 2)
  scene.add(pointLight)
  const setLight = (object, distance) => {
    function generateCombinations(a, b, c, d) {
      const operations = [(x) => x + d, (x) => x - d, (x) => x]
      const combinations = []

      operations.forEach((operationA) => {
        operations.forEach((operationB) => {
          operations.forEach((operationC) => {
            combinations.push([operationA(a), operationB(b), operationC(c)])
          })
        })
      })

      return combinations
    }

    const a = object.position.x
    const b = object.position.y
    const c = object.position.z
    const d = distance

    const positionList = generateCombinations(a, b, c, d)

    positionList.forEach((pos) => {
      const pointLight = new THREE.PointLight(0xffffff, 1, 10)
      pointLight.position.set(...pos)
      scene.add(pointLight)
    })
  }
  setLight(model.scene, 10)

  // API keyの取得モーダル
  apiKeyModal.style.display = 'block'
  const micButton = createMicButton()
  // Hammerインスタンスの作成
  const hammer = new Hammer(micButton)

  let timeoutId
  const stateList = ['wait', 'recording', 'processing', 'reply']
  let processState = stateList[0]
  let whisperMessage
  let chatGptMessage
  async function executeActionByState(state) {
    switch (state) {
      case 'wait':
        console.log('レコーディング開始')
        recorder.startRecording()
        processState = stateList[1]
        break

      case 'recording':
        console.log('レコーディング終了')
        const mp3Data = await recorder.stopRecording()
        const mp3Blob = new Blob([mp3Data], { type: 'audio/mpeg' })
        // createPlayButton(mp3Blob)
        whisperMessage = await transcribeAudio(mp3Blob, inputApiKey.value)
        console.log('mp3Data: ', mp3Data)
        console.log(whisperMessage)
        processState = stateList[2]
        executeActionByState(processState)
        break

      case 'processing':
        processState = stateList[3]
        chatGptMessage = await chatCompletions(
          [
            {
              role: 'user',
              content: whisperMessage.text,
            },
          ],
          inputApiKey.value
        )
        executeActionByState(processState)
        break

      case 'reply':
        console.log('返答取得')
        console.log(chatGptMessage)
        modalTextElement.innerHTML = chatGptMessage.choices[0].message.content
        modal.style.display = 'block'
        processState = stateList[0]
        break

      default:
        console.log('未定義の状態です')
        break
    }
  }

  hammer.on('press', () => {
    if (processState === 'wait') {
      micButton.classList.add('pressed')
      executeActionByState(processState)
    }
    timeoutId = setTimeout(() => {
      if (processState === 'recording') {
        micButton.classList.remove('pressed')
        executeActionByState(processState)
      }
    }, 5000)
  })

  hammer.on('pressup', () => {
    clearTimeout(timeoutId)
    if (processState === 'recording') {
      micButton.classList.remove('pressed')
      executeActionByState(processState)
    }
  })

  const clock = new THREE.Clock()
  // 再生開始 (カメラ映像を投影)
  function loop() {
    requestAnimationFrame(loop)
    if (mixer) {
      const delta = clock.getDelta()
      mixer.update(delta)
    }
    controls.update()
    renderer.render(scene, camera)
  }
  loop()
}
