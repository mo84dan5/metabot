export function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Mobi|Android/i.test(userAgent);
}

export async function requestDevicePermissions() {
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    await DeviceOrientationEvent.requestPermission();
  }
}

export async function getWebcamStream(constraints) {
  return await navigator.mediaDevices.getUserMedia(constraints);
}

export function loadGLTFModel(url) {
  const loader = new THREE.GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf),
      undefined,
      (error) => reject(error)
    );
  });
}

export function getUrlParams() {
  return new URLSearchParams(window.location.search);
}

export function getLanguage(params) {
  return params.get('lang') || 'ja';
}

export function getApiKey(params) {
  const key = params.get('key');
  return key ? `sk-${key}` : null;
}