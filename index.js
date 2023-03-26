const _version = 'index.js: v1.16'
console.log(_version)

// モーダル要素を取得
const modal = document.getElementById('myModal')

// OKボタン要素を取得
const okButton = document.querySelector('.ok-button')

// 閉じるボタン要素を取得
const closeButton = document.querySelector('.close')

const modalTextElement = document.getElementById('modal-text')
const baseText =
  'このアプリケーションはカメラと音声、動作と方向等へのアクセス許可が必要です。'
modalTextElement.innerHTML = baseText + '\n' + _version

// ページ読み込み時にモーダルを表示

modal.style.display = 'block'

// OKボタンがクリックされたときの処理
okButton.onclick = function () {
  modal.style.display = 'none'
  main().catch((e) => {
    console.log(e)
    modalTextElement.innerHTML = e
    modal.style.display = 'block'
  })
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
  if (isMobile()) {
    await requestPermission()
    video = document.createElement('video')
    webcamTexture = await getWebcamTexture(video)
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
  if (isMobile) {
    controls = new THREE.DeviceOrientationControls(camera, true)
  } else {
    controls = new THREE.OrbitControls(camera, renderer.domElement)
  }
  controls.connect()

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
    const positionList = [
      [object.position.x + distance, object.position.y, object.position.z],
      [object.position.x, object.position.y + distance, object.position.z],
      [object.position.x, object.position.y, object.position.z + distance],
      [object.position.x - distance, object.position.y, object.position.z],
      [object.position.x, object.position.y - distance, object.position.z],
      [object.position.x, object.position.y, object.position.z - distance],
    ]
    positionList.forEach((pos) => {
      const pointLight = new THREE.PointLight(0xffffff, 1, 10)
      console.log(...pos)
      pointLight.position.set(...pos)
      scene.add(pointLight)
    })
  }
  setLight(model.scene, 10)

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
